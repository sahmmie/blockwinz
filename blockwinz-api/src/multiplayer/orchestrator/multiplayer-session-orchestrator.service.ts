import {
  forwardRef,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DbGameSchema } from '@blockwinz/shared';
import { Currency } from '@blockwinz/shared';
import { DRIZZLE } from 'src/database/constants';
import type { DrizzleDb } from 'src/database/database.module';
import {
  GameSessionDocument,
  GameSessionService,
} from '../game-session/game-session.service';
import { MultiplayerSessionStatus } from '../game-session/interfaces/game-session.interface';
import { MultiplayerGameRegistry } from '../plugins/multiplayer-game-registry.service';
import type { MultiplayerGamePlugin } from '../plugins/multiplayer-game-plugin.interface';
import { MultiplayerSettlementService } from '../settlement/multiplayer-settlement.service';
import { UserDto } from 'src/shared/dtos/user.dto';
import { getUserId } from 'src/shared/helpers/user.helper';
import { WsExceptionWithCode } from 'src/shared/filters/ws-exception-with-code';
import { WalletRepository } from 'src/wallet/repositories/wallet.repository';
import type { PlayerSessionTrackerService } from '../players/player-session-tracker.service';

function asUser(id: string): UserDto {
  return { _id: id } as UserDto;
}

/**
 * Game-agnostic flow: seat players, start matches, validate moves, settle wallets.
 */
@Injectable()
export class MultiplayerSessionOrchestrator {
  private readonly logger = new Logger(MultiplayerSessionOrchestrator.name);

  constructor(
    private readonly registry: MultiplayerGameRegistry,
    @Inject(forwardRef(() => GameSessionService))
    private readonly gameSessionService: GameSessionService,
    private readonly settlement: MultiplayerSettlementService,
    private readonly eventEmitter: EventEmitter2,
    @Inject(DRIZZLE) private readonly db: DrizzleDb,
    @Inject(forwardRef(() => WalletRepository))
    private readonly walletRepository: WalletRepository,
  ) {}

  /**
   * Returns the plugin for a game type, or null if multiplayer is not implemented.
   */
  getPluginOrNull(gameType: DbGameSchema): MultiplayerGamePlugin | null {
    return this.registry.tryGet(gameType) ?? null;
  }

  /**
   * Creates the per-game DB row, locks stakes, and moves the session to `in_progress` when ready.
   */
  async tryStartGameplay(sessionId: string): Promise<void> {
    const session = await this.gameSessionService.getSessionById(sessionId);
    if (!session?.gameType) return;

    let plugin: MultiplayerGamePlugin;
    try {
      plugin = this.registry.get(session.gameType as DbGameSchema);
    } catch {
      return;
    }

    if (session.gameId) return;
    if (session.players.length < plugin.minPlayers) return;
    if (session.gameStatus !== MultiplayerSessionStatus.PENDING) return;

    const ctx = this.toCtx(session);
    const bet = session.betAmount;
    const currency = session.currency as Currency;

    await this.db.transaction(async (tx) => {
      const txDb = tx as unknown as DrizzleDb;

      if (bet > 0) {
        for (const pid of session.players) {
          await this.walletRepository.lockBetFunds(
            asUser(pid),
            bet,
            currency,
            txDb,
          );
        }
      }

      const initial = await plugin.buildInitialState(ctx);
      const saved = await plugin.persistState(sessionId, initial, txDb);

      const gameRowId = (saved as { id?: string }).id;
      if (!gameRowId) {
        throw new Error('Persisted game state missing id');
      }

      const deadline = new Date(Date.now() + plugin.turnPolicy.turnMs);
      await this.gameSessionService.updateSessionFields(txDb, sessionId, {
        gameId: gameRowId,
        gameStatus: MultiplayerSessionStatus.IN_PROGRESS,
        turnDeadlineAt: deadline,
        reconnectGraceUntil: null,
      });
    });

    const refreshed = await this.gameSessionService.getSessionById(sessionId);
    const state = await plugin.loadStateBySessionId(sessionId);
    this.eventEmitter.emit('game.started', {
      sessionId,
      gameId: refreshed?.gameId,
      state: state ? plugin.toPublicView(state) : null,
    });
    this.logger.log(`Started multiplayer game for session ${sessionId}`);
  }

  /**
   * Applies a player move, persists state, emits realtime events, and settles when terminal.
   */
  async submitMove(
    user: UserDto,
    payload: { sessionId: string; move: unknown },
  ): Promise<unknown> {
    const userId = getUserId(user);
    const { sessionId, move } = payload;

    const session = await this.gameSessionService.getSessionById(sessionId);
    if (!session) {
      throw new WsExceptionWithCode('Session not found', 404);
    }
    if (session.gameStatus !== MultiplayerSessionStatus.IN_PROGRESS) {
      throw new WsExceptionWithCode('Game is not in progress', 400);
    }

    const plugin = this.registry.get(session.gameType as DbGameSchema);
    const state = await plugin.loadStateBySessionId(sessionId);
    if (!state) {
      throw new WsExceptionWithCode('Game state not found', 404);
    }

    const ctx = this.toCtx(session);
    const valid = plugin.validateMove(ctx, state, userId, move);
    if (valid !== true) {
      this.eventEmitter.emit('game.invalidMove', {
        sessionId,
        playerId: userId,
        reason: valid,
      });
      throw new WsExceptionWithCode(valid, 400);
    }

    const result = plugin.applyMove(ctx, state, userId, move);
    const saved = await plugin.persistState(sessionId, result.newState);

    const nextDeadline = result.terminal
      ? null
      : new Date(Date.now() + plugin.turnPolicy.turnMs);
    await this.gameSessionService.updateSessionFields(this.db, sessionId, {
      turnDeadlineAt: nextDeadline,
      reconnectGraceUntil: null,
    });

    if (!result.terminal) {
      this.eventEmitter.emit('game.move', {
        sessionId,
        playerId: userId,
        move,
        gameState: plugin.toPublicView(saved, userId),
      });
      return { ok: true, state: saved };
    }

    if (result.outcome) {
      await this.settlement.settleSession(session, result.outcome, saved);
    }

    this.eventEmitter.emit('game.finished', {
      sessionId,
      winner: result.outcome?.winnerUserIds?.[0] ?? null,
      finalState: saved,
    });

    return { ok: true, finished: true, state: saved };
  }

  /**
   * When `turn_deadline_at` has passed: delegates to plugin (`forfeit` or `auto_move`).
   */
  async handleTurnDeadline(sessionId: string): Promise<void> {
    const session = await this.gameSessionService.getSessionById(sessionId);
    if (
      !session?.gameId ||
      session.gameStatus !== MultiplayerSessionStatus.IN_PROGRESS
    ) {
      return;
    }

    const plugin = this.registry.tryGet(session.gameType as DbGameSchema);
    if (!plugin) {
      return;
    }

    const state = await plugin.loadStateBySessionId(sessionId);
    if (!state) {
      return;
    }

    const ctx = this.toCtx(session);
    const result = await plugin.resolveTurnTimeout(ctx, state);
    if (!result) {
      return;
    }

    const saved = await plugin.persistState(sessionId, result.newState);

    const nextDeadline = result.terminal
      ? null
      : new Date(Date.now() + plugin.turnPolicy.turnMs);
    await this.gameSessionService.updateSessionFields(this.db, sessionId, {
      turnDeadlineAt: nextDeadline,
      reconnectGraceUntil: null,
    });

    if (!result.terminal) {
      const lastMove = (
        saved as { moveHistory?: Array<{ userId: string }> }
      )?.moveHistory?.at(-1);
      const moverId = lastMove?.userId ?? 'system';
      this.eventEmitter.emit('game.move', {
        sessionId,
        playerId: moverId,
        move: { auto: true },
        gameState: plugin.toPublicView(saved, moverId),
      });
      return;
    }

    if (result.outcome) {
      await this.settlement.settleSession(session, result.outcome, saved);
    }

    this.eventEmitter.emit('game.finished', {
      sessionId,
      winner: result.outcome?.winnerUserIds?.[0] ?? null,
      finalState: saved,
    });
  }

  /**
   * Applies draw or win when `reconnect_grace_until` has passed (plugin-driven).
   */
  async applyReconnectGraceResolution(
    sessionId: string,
    tracker: PlayerSessionTrackerService,
  ): Promise<void> {
    const session = await this.gameSessionService.getSessionById(sessionId);
    if (
      !session?.gameId ||
      session.gameStatus !== MultiplayerSessionStatus.IN_PROGRESS ||
      !session.reconnectGraceUntil ||
      session.reconnectGraceUntil > new Date()
    ) {
      return;
    }

    const plugin = this.registry.tryGet(session.gameType as DbGameSchema);
    if (!plugin) {
      await this.gameSessionService.updateSessionFields(this.db, sessionId, {
        reconnectGraceUntil: null,
      });
      return;
    }

    const state = await plugin.loadStateBySessionId(sessionId);
    if (!state) {
      return;
    }

    const ctx = this.toCtx(session);
    const snapshots = await Promise.all(
      session.players.map(async (pid) => {
        const s = await tracker.getPlayerStatus(pid);
        return {
          userId: pid,
          connected: s ? s.connected : true,
        };
      }),
    );

    const result = await plugin.resolveReconnectGraceTimeout(
      ctx,
      state,
      snapshots,
    );

    if (!result) {
      await this.gameSessionService.updateSessionFields(this.db, sessionId, {
        reconnectGraceUntil: null,
      });
      return;
    }

    const saved = await plugin.persistState(sessionId, result.newState);
    await this.gameSessionService.updateSessionFields(this.db, sessionId, {
      turnDeadlineAt: null,
      reconnectGraceUntil: null,
    });

    if (result.outcome) {
      await this.settlement.settleSession(session, result.outcome, saved);
    }

    this.eventEmitter.emit('game.finished', {
      sessionId,
      winner: result.outcome?.winnerUserIds?.[0] ?? null,
      finalState: saved,
    });
  }

  private toCtx(session: GameSessionDocument) {
    return {
      sessionId: session._id,
      gameType: session.gameType as DbGameSchema,
      players: session.players,
      betAmount: session.betAmount,
      currency: session.currency,
    };
  }
}
