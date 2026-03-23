import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PlayerSessionState } from './interfaces/player-session.interface';
import { RedisService } from 'src/shared/services/redis.service';

const MP_PRESENCE_PREFIX = 'mp:presence:';
const PRESENCE_TTL_SEC = 600;

@Injectable()
export class PlayerSessionTrackerService {
  private readonly logger = new Logger(PlayerSessionTrackerService.name);
  private readonly playerToSession: Map<string, string> = new Map();
  private readonly sessionStates: Map<string, PlayerSessionState> = new Map();

  constructor(
    private readonly eventEmitter: EventEmitter2,
    private readonly redisService: RedisService,
  ) {}

  markConnected(playerId: string, sessionId: string) {
    const now = Date.now();
    this.playerToSession.set(playerId, sessionId);
    const state: PlayerSessionState = {
      playerId,
      sessionId,
      connected: true,
      lastActive: now,
    };
    this.sessionStates.set(playerId, state);
    void this.redisService.setJsonEx(
      `${MP_PRESENCE_PREFIX}${playerId}`,
      state,
      PRESENCE_TTL_SEC,
    );
    this.logger.log(`Player ${playerId} connected to session ${sessionId}`);
  }

  markDisconnected(playerId: string) {
    const state = this.sessionStates.get(playerId);
    if (state) {
      state.connected = false;
      state.disconnectedAt = Date.now();
      this.sessionStates.set(playerId, state);
      void this.redisService.setJsonEx(
        `${MP_PRESENCE_PREFIX}${playerId}`,
        state,
        PRESENCE_TTL_SEC,
      );
      this.logger.log(
        `Player ${playerId} disconnected from session ${state.sessionId}`,
      );
      this.eventEmitter.emit('player.disconnected', {
        playerId,
        sessionId: state.sessionId,
      });
    }
  }

  updateHeartbeat(playerId: string) {
    const state = this.sessionStates.get(playerId);
    if (state) {
      state.lastActive = Date.now();
      state.connected = true;
      this.sessionStates.set(playerId, state);
      void this.redisService.setJsonEx(
        `${MP_PRESENCE_PREFIX}${playerId}`,
        state,
        PRESENCE_TTL_SEC,
      );
      this.logger.log(`Heartbeat updated for player ${playerId}`);
    }
  }

  async getPlayerStatus(playerId: string): Promise<PlayerSessionState | undefined> {
    const mem = this.sessionStates.get(playerId);
    if (mem) {
      return mem;
    }
    const raw = await this.redisService.getJson(`${MP_PRESENCE_PREFIX}${playerId}`);
    if (!raw || typeof raw !== 'object') {
      return undefined;
    }
    const o = raw as Record<string, unknown>;
    return {
      playerId: String(o.playerId ?? playerId),
      sessionId: String(o.sessionId ?? ''),
      connected: Boolean(o.connected),
      lastActive: Number(o.lastActive ?? 0),
      disconnectedAt:
        o.disconnectedAt !== undefined
          ? Number(o.disconnectedAt)
          : undefined,
    };
  }

  getSessionPlayers(sessionId: string): PlayerSessionState[] {
    return Array.from(this.sessionStates.values()).filter(
      (s) => s.sessionId === sessionId,
    );
  }

  /**
   * Returns all tracked player/socket states (for AFK heuristics).
   */
  getAllSessionStates(): PlayerSessionState[] {
    return Array.from(this.sessionStates.values());
  }

  /** Synchronous status for hot paths (in-memory only). */
  getPlayerStatusSync(playerId: string): PlayerSessionState | undefined {
    return this.sessionStates.get(playerId);
  }
}
