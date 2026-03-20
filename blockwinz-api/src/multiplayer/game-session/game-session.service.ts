import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Inject } from '@nestjs/common';
import { GameSessionStatus } from './interfaces/game-session.interface';
import { UserDto } from 'src/shared/dtos/user.dto';
import { getUserId } from 'src/shared/helpers/user.helper';
import { MultiplayerGameEmitterEvent } from 'src/shared/eventEmitters/gameEmitterEvent.enum';
import { DbGameSchema } from 'src/shared/enums/dbSchema.enum';
import { WsExceptionWithCode } from 'src/shared/filters/ws-exception-with-code';
import { DRIZZLE } from 'src/database/constants';
import type { DrizzleDb } from 'src/database/database.module';
import { gameSessions } from 'src/database/schema/game-sessions';
import { eq, and } from 'drizzle-orm';
import type {
  GameSessionSelect,
  GameSessionInsert,
} from 'src/database/schema/game-sessions';

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
};

@Injectable()
export class GameSessionService {
  private readonly logger = new Logger(GameSessionService.name);

  constructor(
    private readonly eventEmitter: EventEmitter2,
    @Inject(DRIZZLE) private readonly db: DrizzleDb,
  ) {}

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

      const [row] = await this.db
        .insert(gameSessions)
        .values({
          userId,
          gameType: payload.gameType,
          players: [userId],
          betAmount: String(payload.betAmount),
          betAmountMustEqual: payload.betAmountMustEqual ?? false,
          currency: payload.currency,
          gameStatus: GameSessionStatus.PENDING,
          invitedPlayers,
          invitedEmail,
          gameId: null,
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

  async getActiveGame(
    user: UserDto,
    gameType: DbGameSchema,
  ): Promise<GameSessionDocument | null> {
    if (!gameType) throw new WsExceptionWithCode('Game type is required', 400);
    this.logger.log(`Getting active game for user ${user.username}`);
    const userId = getUserId(user);

    const rows = await this.db
      .select()
      .from(gameSessions)
      .where(eq(gameSessions.gameStatus, GameSessionStatus.IN_PROGRESS));
    const row = rows.find((r) => (r.players ?? []).includes(userId)) ?? null;

    if (!row) return null;
    if (!row.gameId) {
      this.eventEmitter.emit(
        MultiplayerGameEmitterEvent.SESSION_CREATED,
        this.rowToDocument(row),
      );
      this.logger.log(`Game created for user ${user.username}`);
    }
    return this.rowToDocument(row);
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

  handleGameAction(message: string, user: UserDto) {
    this.logger.log(
      `handleGameAction: message=${message}, user=${user.username}`,
    );
  }

  joinGame(gameId: string, user: UserDto) {
    this.logger.log(`joinGame: gameId=${gameId}, user=${user.username}`);
  }

  leaveGame(gameId: string, user: UserDto) {
    this.logger.log(`leaveGame: gameId=${gameId}, user=${user.username}`);
  }

  handleDisconnect(id: string) {
    this.logger.log(`handleDisconnect: id=${id}`);
  }

  private rowToDocument(row: GameSessionSelect): GameSessionDocument {
    return {
      ...row,
      _id: row.id,
      user: row.userId,
      gameId: row.gameId,
      players: row.players ?? [],
      betAmount: Number(row.betAmount),
      gameType: row.gameType,
      betAmountMustEqual: row.betAmountMustEqual ?? false,
      currency: row.currency,
      gameStatus: row.gameStatus,
      invitedPlayers: row.invitedPlayers ?? [],
      invitedEmail: row.invitedEmail ?? [],
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    } as GameSessionDocument;
  }
}
