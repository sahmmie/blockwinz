import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { createHash, randomBytes } from 'crypto';
import { and, asc, desc, eq, inArray, sql } from 'drizzle-orm';
import { MultiplayerSessionStatus } from './interfaces/game-session.interface';
import { UserDto } from 'src/shared/dtos/user.dto';
import { getUserId } from 'src/shared/helpers/user.helper';
import { MultiplayerGameEmitterEvent } from 'src/shared/eventEmitters/gameEmitterEvent.enum';
import { Currency, DbGameSchema } from '@blockwinz/shared';
import { WsExceptionWithCode } from 'src/shared/filters/ws-exception-with-code';
import { DRIZZLE } from 'src/database/constants';
import type { DrizzleDb } from 'src/database/database.module';
import { gameSessions } from 'src/database/schema/game-sessions';
import type {
  GameSessionSelect,
  GameSessionInsert,
} from 'src/database/schema/game-sessions';
import { MultiplayerSessionOrchestrator } from '../orchestrator/multiplayer-session-orchestrator.service';
import { WalletRepository } from 'src/wallet/repositories/wallet.repository';

/** Session document shape returned by this service (Drizzle-backed). */
export type GameSessionDocument = GameSessionSelect & {
  _id: string;
  user: string;
  gameId: string | null;
  players: string[];
  betAmount: number;
  gameType: string;
  betAmountMustEqual: boolean;
  currency: string;
  gameStatus: string;
  invitedPlayers?: string[];
  invitedEmail?: string[];
  visibility: string;
  hostUserId: string | null;
  maxPlayers: number;
  joinCodeHash: string | null;
  spectatorsAllowed: boolean;
  spectatorUserIds: string[];
  turnDeadlineAt: Date | null;
  settledAt: Date | null;
  reconnectGraceUntil: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
};

/** Payload accepted when creating a session (e.g. from gateway). */
export type CreateSessionPayload = {
  gameType: string;
  betAmount: number;
  betAmountMustEqual?: boolean;
  currency: string;
  invitedPlayers?: string[] | unknown[];
  invitedEmail?: string[];
  visibility?: string;
  maxPlayers?: number;
  /** Plaintext join code; stored as SHA-256 hash. */
  joinCode?: string;
};

/** Active session row plus hydrated per-game public state when `IN_PROGRESS`. */
export type ActiveMultiplayerSessionDocument = GameSessionDocument & {
  gameState?: unknown;
};

/** Optional client echo when joining (defense in depth with `bet_amount_must_equal`). */
export type JoinGameOptions = {
  betAmount?: number;
  currency?: string;
};

@Injectable()
export class GameSessionService {
  private readonly logger = new Logger(GameSessionService.name);

  constructor(
    private readonly eventEmitter: EventEmitter2,
    @Inject(DRIZZLE) private readonly db: DrizzleDb,
    private readonly walletRepository: WalletRepository,
    @Inject(forwardRef(() => MultiplayerSessionOrchestrator))
    private readonly orchestrator: MultiplayerSessionOrchestrator,
  ) {}

  /**
   * Creates a lobby row for the host (single player until others join).
   */
  async createSession(
    user: UserDto,
    payload: CreateSessionPayload,
  ): Promise<GameSessionDocument> {
    try {
      this.logger.log(`Creating game for user ${user.username}`);
      const hasActiveGame = await this.getActiveGame(
        user,
        payload.gameType as DbGameSchema,
      );
      if (hasActiveGame) {
        throw new Error('User already has an active game');
      }

      const userId = getUserId(user);
      const invitedPlayers = (payload.invitedPlayers ?? []).map((id) =>
        String(id),
      );
      const invitedEmail = payload.invitedEmail ?? [];
      const visibility =
        payload.visibility === 'private' ? 'private' : 'public';
      const maxPlayers = payload.maxPlayers ?? 2;
      const joinCodeHash = payload.joinCode
        ? createHash('sha256').update(payload.joinCode).digest('hex')
        : null;

      if (payload.betAmount > 0) {
        try {
          await this.walletRepository.checkPlayerBalance(
            user,
            payload.betAmount,
            payload.currency as Currency,
          );
        } catch (e) {
          if (e instanceof BadRequestException) {
            throw new Error(e.message);
          }
          if (e instanceof NotFoundException) {
            throw new Error(e.message);
          }
          throw e;
        }
      }

      const [row] = await this.db
        .insert(gameSessions)
        .values({
          userId,
          gameType: payload.gameType,
          players: [userId],
          betAmount: String(payload.betAmount),
          betAmountMustEqual: payload.betAmountMustEqual ?? false,
          currency: payload.currency,
          gameStatus: MultiplayerSessionStatus.PENDING,
          invitedPlayers,
          invitedEmail,
          gameId: null,
          visibility,
          hostUserId: userId,
          maxPlayers,
          joinCodeHash,
          spectatorsAllowed: false,
          spectatorUserIds: [],
        } as GameSessionInsert)
        .returning();

      if (!row) throw new Error('Failed to create game session');

      const session = this.rowToDocument(row);
      this.logger.verbose(
        `Emitting ${MultiplayerGameEmitterEvent.SESSION_CREATED} event for user ${user.username}`,
      );
      this.eventEmitter.emit(
        MultiplayerGameEmitterEvent.SESSION_CREATED,
        session,
      );
      this.eventEmitter.emit(MultiplayerGameEmitterEvent.LOBBY_UPDATED, {
        gameType: session.gameType as DbGameSchema,
        reason: 'lobby_created',
        sessionId: session._id,
        session,
      });
      await this.orchestrator.tryStartGameplay(session._id);
      this.logger.log(`Game created for user ${user.username}`);
      return session;
    } catch (error) {
      this.logger.error(
        `Error creating game for user ${user.username}:`,
        error,
      );
      throw new WsExceptionWithCode(
        (error as Error).message || 'Failed to create game session',
        500,
      );
    }
  }

  /**
   * Creates a session already filled with two players (quick match / Redis pairing).
   */
  async createMatchedSession(params: {
    playerOneId: string;
    playerTwoId: string;
    gameType: DbGameSchema;
    betAmount: number;
    currency: string;
    visibility?: string;
  }): Promise<GameSessionDocument> {
    const {
      playerOneId,
      playerTwoId,
      gameType,
      betAmount,
      currency,
      visibility = 'public',
    } = params;

    if (betAmount > 0) {
      const u1 = { _id: playerOneId } as UserDto;
      const u2 = { _id: playerTwoId } as UserDto;
      try {
        await this.walletRepository.checkPlayerBalance(
          u1,
          betAmount,
          currency as Currency,
        );
        await this.walletRepository.checkPlayerBalance(
          u2,
          betAmount,
          currency as Currency,
        );
      } catch (e) {
        if (e instanceof BadRequestException) {
          throw new Error(e.message);
        }
        if (e instanceof NotFoundException) {
          throw new Error(e.message);
        }
        throw e;
      }
    }

    const [row] = await this.db
      .insert(gameSessions)
      .values({
        userId: playerOneId,
        gameType,
        players: [playerOneId, playerTwoId],
        betAmount: String(betAmount),
        betAmountMustEqual: true,
        currency,
        gameStatus: MultiplayerSessionStatus.PENDING,
        invitedPlayers: [],
        invitedEmail: [],
        gameId: null,
        visibility,
        hostUserId: playerOneId,
        maxPlayers: 2,
        joinCodeHash: null,
        spectatorsAllowed: false,
        spectatorUserIds: [],
      } as GameSessionInsert)
      .returning();

    if (!row) throw new Error('Failed to create matched session');
    const session = this.rowToDocument(row);
    this.eventEmitter.emit(
      MultiplayerGameEmitterEvent.SESSION_CREATED,
      session,
    );
    try {
      await this.orchestrator.tryStartGameplay(session._id);
    } catch (e) {
      await this.db
        .delete(gameSessions)
        .where(eq(gameSessions.id, session._id));
      const msg =
        e instanceof Error ? e.message : 'Failed to start matched game';
      this.logger.error(`createMatchedSession rollback: ${msg}`);
      throw new WsExceptionWithCode(msg, 500);
    }
    return session;
  }

  /**
   * Returns the current user's pending or in-progress session for a game type.
   * When the session is `IN_PROGRESS`, attaches `gameState` from the multiplayer plugin public view.
   */
  async getActiveGame(
    user: UserDto,
    gameType: DbGameSchema,
  ): Promise<ActiveMultiplayerSessionDocument | null> {
    if (!gameType) throw new WsExceptionWithCode('Game type is required', 400);
    this.logger.log(`Getting active game for user ${user.username}`);
    const userId = getUserId(user);

    const rows = await this.db
      .select()
      .from(gameSessions)
      .where(
        and(
          eq(gameSessions.gameType, gameType),
          inArray(gameSessions.gameStatus, [
            MultiplayerSessionStatus.PENDING,
            MultiplayerSessionStatus.IN_PROGRESS,
          ]),
          sql`${userId}::uuid = ANY(${gameSessions.players})`,
        ),
      );

    const row = rows[0] ?? null;
    if (!row) {
      return null;
    }
    const doc = this.rowToDocument(row);
    if (doc.gameStatus === MultiplayerSessionStatus.IN_PROGRESS && doc.gameId) {
      const plugin = this.orchestrator.getPluginOrNull(gameType);
      if (plugin) {
        const state = await plugin.loadStateBySessionId(doc._id);
        if (state) {
          return {
            ...doc,
            gameState: plugin.toPublicView(state, userId),
          };
        }
      }
    }
    return doc;
  }

  /**
   * Lists public lobbies waiting for players (excludes private and in-progress games).
   */
  async listPublicLobbies(
    gameType: DbGameSchema,
    limit = 50,
  ): Promise<GameSessionDocument[]> {
    const rows = await this.db
      .select()
      .from(gameSessions)
      .where(
        and(
          eq(gameSessions.gameType, gameType),
          eq(gameSessions.gameStatus, MultiplayerSessionStatus.PENDING),
          eq(gameSessions.visibility, 'public'),
        ),
      )
      .orderBy(desc(gameSessions.createdAt))
      .limit(limit);

    return rows.map((r) => this.rowToDocument(r));
  }

  /**
   * Cancels an unfilled pending lobby (e.g. TTL). No wallet locks exist until gameplay starts.
   */
  async cancelPendingLobby(sessionId: string): Promise<void> {
    const [row] = await this.db
      .select()
      .from(gameSessions)
      .where(eq(gameSessions.id, sessionId))
      .limit(1);
    if (!row || row.gameStatus !== MultiplayerSessionStatus.PENDING) {
      return;
    }
    await this.db
      .update(gameSessions)
      .set({
        gameStatus: MultiplayerSessionStatus.CANCELLED,
        players: [],
        updatedAt: new Date(),
      } as Record<string, unknown>)
      .where(eq(gameSessions.id, sessionId));
    this.eventEmitter.emit(MultiplayerGameEmitterEvent.LOBBY_EXPIRED, {
      sessionId,
      gameType: row.gameType as DbGameSchema,
    });
    this.eventEmitter.emit(MultiplayerGameEmitterEvent.LOBBY_UPDATED, {
      gameType: row.gameType as DbGameSchema,
      reason: 'lobby_expired',
      sessionId,
      session: null,
    });
  }

  /**
   * Loads a session by primary key (session id).
   */
  async getSessionById(sessionId: string): Promise<GameSessionDocument | null> {
    const [row] = await this.db
      .select()
      .from(gameSessions)
      .where(eq(gameSessions.id, sessionId))
      .limit(1);
    return row ? this.rowToDocument(row) : null;
  }

  /**
   * First joinable public lobby for quick match (same game, stake, currency, not full).
   */
  async findJoinablePublicLobby(params: {
    gameType: DbGameSchema;
    betAmount: number;
    currency: string;
  }): Promise<string | null> {
    const rows = await this.db
      .select()
      .from(gameSessions)
      .where(
        and(
          eq(gameSessions.gameType, params.gameType),
          eq(gameSessions.gameStatus, MultiplayerSessionStatus.PENDING),
          eq(gameSessions.visibility, 'public'),
          eq(gameSessions.betAmount, String(params.betAmount)),
          eq(gameSessions.currency, params.currency),
          sql`COALESCE(cardinality(${gameSessions.players}), 0) < ${gameSessions.maxPlayers}`,
        ),
      )
      .orderBy(asc(gameSessions.createdAt))
      .limit(1);
    return rows[0]?.id ?? null;
  }

  /**
   * Prefer joining an existing public lobby before Redis queue (quick match).
   */
  async tryJoinOrEnqueueQuickMatch(
    user: UserDto,
    params: {
      gameId: DbGameSchema;
      betAmount: number;
      currency: string;
    },
    enqueue: () => Promise<'waiting' | 'matched'>,
  ): Promise<
    | { kind: 'joined'; session: GameSessionDocument }
    | { kind: 'queued'; status: 'waiting' | 'matched' }
  > {
    const lobbyId = await this.findJoinablePublicLobby({
      gameType: params.gameId,
      betAmount: params.betAmount,
      currency: params.currency,
    });
    if (lobbyId) {
      const session = await this.joinGame(lobbyId, user, {
        betAmount: params.betAmount,
        currency: params.currency,
      });
      return { kind: 'joined', session };
    }
    const status = await enqueue();
    return { kind: 'queued', status };
  }

  /**
   * Joins a multiplayer lobby by session id. Validates capacity, privacy, invites,
   * currency alignment, lobby stake rules (`bet_amount_must_equal`), and sufficient wallet balance for the session stake.
   */
  async joinGame(
    sessionId: string,
    user: UserDto,
    options?: JoinGameOptions,
  ): Promise<GameSessionDocument> {
    const userId = getUserId(user);
    const [row] = await this.db
      .select()
      .from(gameSessions)
      .where(eq(gameSessions.id, sessionId))
      .limit(1);

    if (!row) {
      throw new WsExceptionWithCode('Session not found', 404);
    }

    if (
      row.gameStatus !== MultiplayerSessionStatus.PENDING &&
      row.gameStatus !== MultiplayerSessionStatus.IN_PROGRESS
    ) {
      throw new WsExceptionWithCode('Session is not joinable', 400);
    }

    const players = (row.players ?? []).map(String);
    if (players.includes(userId)) {
      return this.rowToDocument(row);
    }

    if (players.length >= (row.maxPlayers ?? 2)) {
      throw new WsExceptionWithCode('Session is full', 400);
    }

    if (row.visibility === 'private') {
      const invited = (row.invitedPlayers ?? []).map(String);
      if (invited.length > 0 && !invited.includes(userId)) {
        throw new WsExceptionWithCode('Invite required for this session', 403);
      }
    }

    await this.validateJoinStakeAndWallet(user, row, options);

    const nextPlayers = [...players, userId];

    const [updated] = await this.db
      .update(gameSessions)
      .set({
        players: nextPlayers,
        updatedAt: new Date(),
      } as Record<string, unknown>)
      .where(eq(gameSessions.id, sessionId))
      .returning();

    if (!updated) {
      throw new WsExceptionWithCode('Failed to join session', 500);
    }

    const doc = this.rowToDocument(updated);
    this.eventEmitter.emit(MultiplayerGameEmitterEvent.GAME_JOINED, {
      sessionId,
      userId,
      session: doc,
    });
    this.eventEmitter.emit(MultiplayerGameEmitterEvent.LOBBY_UPDATED, {
      gameType: doc.gameType as DbGameSchema,
      reason: 'player_joined',
      sessionId,
      session: doc,
    });
    try {
      await this.orchestrator.tryStartGameplay(sessionId);
    } catch (e) {
      await this.revertJoin(sessionId, userId);
      const msg =
        e instanceof Error ? e.message : 'Failed to start game after join';
      this.logger.error(`tryStartGameplay failed after join: ${msg}`);
      throw new WsExceptionWithCode(msg, 500);
    }
    return doc;
  }

  private async revertJoin(sessionId: string, userId: string): Promise<void> {
    const [row] = await this.db
      .select()
      .from(gameSessions)
      .where(eq(gameSessions.id, sessionId))
      .limit(1);
    if (!row) return;
    const players = (row.players ?? []).map(String).filter((p) => p !== userId);
    await this.db
      .update(gameSessions)
      .set({
        players,
        updatedAt: new Date(),
      } as Record<string, unknown>)
      .where(eq(gameSessions.id, sessionId));
  }

  /**
   * Joins a private session when the user supplies the correct plaintext join code.
   */
  async joinGameWithCode(
    sessionId: string,
    joinCode: string,
    user: UserDto,
    options?: JoinGameOptions,
  ): Promise<GameSessionDocument> {
    const [row] = await this.db
      .select()
      .from(gameSessions)
      .where(eq(gameSessions.id, sessionId))
      .limit(1);

    if (!row?.joinCodeHash) {
      throw new WsExceptionWithCode(
        'This session does not use a join code',
        400,
      );
    }

    const hash = createHash('sha256').update(joinCode).digest('hex');
    if (hash !== row.joinCodeHash) {
      throw new WsExceptionWithCode('Invalid join code', 403);
    }

    return this.joinGame(sessionId, user, options);
  }

  /**
   * Removes the user from a pending lobby; in-progress games are not cancelled here.
   */
  async leaveGame(
    sessionId: string,
    user: UserDto,
  ): Promise<GameSessionDocument | null> {
    const userId = getUserId(user);
    const [row] = await this.db
      .select()
      .from(gameSessions)
      .where(eq(gameSessions.id, sessionId))
      .limit(1);

    if (!row) {
      throw new WsExceptionWithCode('Session not found', 404);
    }

    if (row.gameStatus !== MultiplayerSessionStatus.PENDING) {
      throw new WsExceptionWithCode('Cannot leave: game already started', 400);
    }

    const players = (row.players ?? []).map(String).filter((p) => p !== userId);

    if (players.length === 0) {
      await this.db
        .update(gameSessions)
        .set({
          gameStatus: MultiplayerSessionStatus.CANCELLED,
          players: [],
          updatedAt: new Date(),
        } as Record<string, unknown>)
        .where(eq(gameSessions.id, sessionId));
      return null;
    }

    const [updated] = await this.db
      .update(gameSessions)
      .set({
        players,
        updatedAt: new Date(),
      } as Record<string, unknown>)
      .where(eq(gameSessions.id, sessionId))
      .returning();

    return updated ? this.rowToDocument(updated) : null;
  }

  /**
   * Parses a JSON game action (e.g. move) and forwards to the orchestrator.
   * Supports legacy `{ message: string }` stringified JSON or structured `{ action, sessionId, move }`.
   */
  async handleGameAction(
    payload: string | Record<string, unknown>,
    user: UserDto,
  ): Promise<unknown> {
    let body: Record<string, unknown>;
    if (typeof payload === 'string') {
      try {
        body = JSON.parse(payload) as Record<string, unknown>;
      } catch {
        throw new WsExceptionWithCode('Invalid game action payload', 400);
      }
    } else {
      body = payload;
    }

    const action = String(body.action ?? '');
    if (action === 'move') {
      const sessionId = String(body.sessionId ?? '');
      if (!sessionId) {
        throw new WsExceptionWithCode('sessionId is required', 400);
      }
      let move = body.move as Record<string, unknown> | undefined;
      if (move && 'column' in move && !('col' in move)) {
        move = { ...move, col: move.column };
      }
      return this.orchestrator.submitMove(user, {
        sessionId,
        move: move ?? body.move,
      });
    }

    throw new WsExceptionWithCode(`Unknown action: ${action}`, 400);
  }

  /**
   * Legacy socket disconnect by socket id (no-op for session state).
   */
  handleDisconnect(_socketId: string): void {
    this.logger.verbose(`Socket disconnect: ${_socketId}`);
  }

  /**
   * Marks reconnect grace on the session when a participant disconnects mid-game.
   */
  async handleUserDisconnect(userId: string): Promise<void> {
    const rows = await this.db
      .select()
      .from(gameSessions)
      .where(
        and(
          eq(gameSessions.gameStatus, MultiplayerSessionStatus.IN_PROGRESS),
          sql`${userId}::uuid = ANY(${gameSessions.players})`,
        ),
      );

    const session = rows[0];
    if (!session) return;

    const plugin = this.orchestrator.getPluginOrNull(
      session.gameType as DbGameSchema,
    );
    const graceMs = plugin?.turnPolicy.reconnectGraceMs ?? 120_000;

    await this.db
      .update(gameSessions)
      .set({
        reconnectGraceUntil: new Date(Date.now() + graceMs),
        updatedAt: new Date(),
      } as Record<string, unknown>)
      .where(eq(gameSessions.id, session.id));
  }

  /**
   * Clears `reconnect_grace_until` when a player re-joins the session room or submits a move.
   */
  async clearReconnectGrace(sessionId: string): Promise<void> {
    await this.db
      .update(gameSessions)
      .set({
        reconnectGraceUntil: null,
        updatedAt: new Date(),
      } as Record<string, unknown>)
      .where(
        and(
          eq(gameSessions.id, sessionId),
          eq(gameSessions.gameStatus, MultiplayerSessionStatus.IN_PROGRESS),
        ),
      );
  }

  /**
   * Updates session fields inside an existing transaction (used by orchestrator).
   */
  async updateSessionFields(
    tx: DrizzleDb,
    sessionId: string,
    patch: Partial<{
      gameId: string | null;
      gameStatus: string;
      turnDeadlineAt: Date | null;
      reconnectGraceUntil: Date | null;
    }>,
  ): Promise<void> {
    await tx
      .update(gameSessions)
      .set({
        ...patch,
        updatedAt: new Date(),
      } as Record<string, unknown>)
      .where(eq(gameSessions.id, sessionId));
  }

  /**
   * Generates a random join code for a host to share (stores hash only).
   */
  async setRandomJoinCode(sessionId: string, host: UserDto): Promise<string> {
    const userId = getUserId(host);
    const [row] = await this.db
      .select()
      .from(gameSessions)
      .where(eq(gameSessions.id, sessionId))
      .limit(1);

    if (!row || String(row.hostUserId) !== userId) {
      throw new WsExceptionWithCode('Only the host can set join code', 403);
    }

    const plain = randomBytes(4).toString('hex').toUpperCase();
    const hash = createHash('sha256').update(plain).digest('hex');

    await this.db
      .update(gameSessions)
      .set({
        joinCodeHash: hash,
        visibility: 'private',
        updatedAt: new Date(),
      } as Record<string, unknown>)
      .where(eq(gameSessions.id, sessionId));

    return plain;
  }

  async handlePlayerMove(
    sessionId: string,
    playerId: string,
    move: unknown,
  ): Promise<void> {
    this.logger.log(
      `handlePlayerMove: sessionId=${sessionId}, playerId=${playerId}, move=${JSON.stringify(move)}`,
    );
  }

  async handleSessionCleanup(payload: { id: string }) {
    this.logger.log(`handleSessionCleanup: payload=${JSON.stringify(payload)}`);
  }

  /**
   * Ensures the joiner's wallet can cover the session stake before `tryStartGameplay` locks funds.
   * Currency must match the lobby; when `bet_amount_must_equal` is set, only the fixed table stake
   * is supported until an optional per-join stake is added to the API.
   */
  private async validateJoinStakeAndWallet(
    user: UserDto,
    row: GameSessionSelect,
    options?: JoinGameOptions,
  ): Promise<void> {
    const sessionCurrency = String(row.currency) as Currency;
    const bet = Number(row.betAmount);
    if (bet <= 0 || Number.isNaN(bet)) {
      throw new WsExceptionWithCode('Invalid lobby stake', 400);
    }

    if (row.betAmountMustEqual) {
      if (
        options?.betAmount === undefined ||
        options?.currency === undefined
      ) {
        throw new WsExceptionWithCode(
          'betAmount and currency are required to join this lobby',
          400,
        );
      }
      if (Number(options.betAmount) !== bet) {
        throw new WsExceptionWithCode('Bet amount must match lobby', 400);
      }
      if (String(options.currency) !== String(row.currency)) {
        throw new WsExceptionWithCode('Currency must match lobby', 400);
      }
    } else if (options !== undefined) {
      if (
        options.betAmount !== undefined &&
        Number(options.betAmount) !== bet
      ) {
        throw new WsExceptionWithCode('Bet amount must match lobby', 400);
      }
      if (
        options.currency !== undefined &&
        String(options.currency) !== String(row.currency)
      ) {
        throw new WsExceptionWithCode('Currency must match lobby', 400);
      }
    }

    try {
      await this.walletRepository.checkPlayerBalance(
        user,
        bet,
        sessionCurrency,
      );
    } catch (e) {
      if (e instanceof BadRequestException) {
        throw new WsExceptionWithCode(e.message, 400);
      }
      if (e instanceof NotFoundException) {
        throw new WsExceptionWithCode(e.message, 400);
      }
      throw e;
    }
  }

  private rowToDocument(row: GameSessionSelect): GameSessionDocument {
    return {
      ...row,
      _id: row.id,
      user: row.userId,
      gameId: row.gameId,
      players: (row.players ?? []).map(String),
      betAmount: Number(row.betAmount),
      gameType: row.gameType,
      betAmountMustEqual: row.betAmountMustEqual ?? false,
      currency: row.currency,
      gameStatus: row.gameStatus,
      invitedPlayers: (row.invitedPlayers ?? []).map(String),
      invitedEmail: row.invitedEmail ?? [],
      visibility: row.visibility ?? 'public',
      hostUserId: row.hostUserId ?? null,
      maxPlayers: row.maxPlayers ?? 2,
      joinCodeHash: row.joinCodeHash ?? null,
      spectatorsAllowed: row.spectatorsAllowed ?? false,
      spectatorUserIds: (row.spectatorUserIds ?? []).map(String),
      turnDeadlineAt: row.turnDeadlineAt ?? null,
      settledAt: row.settledAt ?? null,
      reconnectGraceUntil: row.reconnectGraceUntil ?? null,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    } as GameSessionDocument;
  }
}
