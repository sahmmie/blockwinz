import {
  forwardRef,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { and, isNotNull, lt, eq } from 'drizzle-orm';
import { DRIZZLE } from 'src/database/constants';
import type { DrizzleDb } from 'src/database/database.module';
import { gameSessions } from 'src/database/schema/game-sessions';
import { PlayerSessionTrackerService } from '../player-session-tracker.service';
import { MultiplayerSessionStatus } from '../../game-session/interfaces/game-session.interface';
import { MultiplayerSessionOrchestrator } from '../../orchestrator/multiplayer-session-orchestrator.service';

/**
 * Phase-based deadlines from `game_sessions.turn_deadline_at` plus optional in-memory idle hints.
 */
@Injectable()
export class AfkListener {
  private readonly logger = new Logger(AfkListener.name);
  private readonly AFK_THRESHOLD_MS = 30000;

  constructor(
    private readonly tracker: PlayerSessionTrackerService,
    private readonly eventEmitter: EventEmitter2,
    @Inject(DRIZZLE) private readonly db: DrizzleDb,
    @Inject(forwardRef(() => MultiplayerSessionOrchestrator))
    private readonly orchestrator: MultiplayerSessionOrchestrator,
  ) {}

  /**
   * Applies forfeit rules when the DB turn deadline has passed.
   */
  @Interval(5000)
  async checkTurnDeadlines(): Promise<void> {
    const now = new Date();
    const rows = await this.db
      .select({ id: gameSessions.id })
      .from(gameSessions)
      .where(
        and(
          eq(gameSessions.gameStatus, MultiplayerSessionStatus.IN_PROGRESS),
          isNotNull(gameSessions.turnDeadlineAt),
          lt(gameSessions.turnDeadlineAt, now),
        ),
      );

    for (const row of rows) {
      try {
        await this.orchestrator.handleTurnDeadline(row.id);
      } catch (e) {
        this.logger.error(`Turn deadline handling failed for ${row.id}`, e);
      }
    }
  }

  /**
   * Ends or refunds games when disconnect grace has expired (see `handleUserDisconnect`).
   */
  @Interval(5000)
  async checkReconnectGraceExpiry(): Promise<void> {
    const now = new Date();
    const rows = await this.db
      .select({ id: gameSessions.id })
      .from(gameSessions)
      .where(
        and(
          eq(gameSessions.gameStatus, MultiplayerSessionStatus.IN_PROGRESS),
          isNotNull(gameSessions.reconnectGraceUntil),
          lt(gameSessions.reconnectGraceUntil, now),
        ),
      );

    for (const row of rows) {
      try {
        await this.orchestrator.applyReconnectGraceResolution(
          row.id,
          this.tracker,
        );
      } catch (e) {
        this.logger.error(`Reconnect grace handling failed for ${row.id}`, e);
      }
    }
  }

  /**
   * Emits `player.afk` when socket tracker shows extended inactivity (hint only; authoritative timer is DB).
   */
  @Interval(10000)
  checkForAfkPlayers(): void {
    const now = Date.now();
    const allStates = this.tracker.getAllSessionStates();
    for (const state of allStates) {
      if (state.connected && now - state.lastActive > this.AFK_THRESHOLD_MS) {
        this.logger.warn(
          `Player ${state.playerId} is AFK in session ${state.sessionId}`,
        );
        this.eventEmitter.emit('player.afk', {
          playerId: state.playerId,
          sessionId: state.sessionId,
        });
      }
    }
  }
}
