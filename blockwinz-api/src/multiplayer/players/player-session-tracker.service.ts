import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PlayerSessionState } from './interfaces/player-session.interface';

@Injectable()
export class PlayerSessionTrackerService {
  private readonly logger = new Logger(PlayerSessionTrackerService.name);
  private readonly playerToSession: Map<string, string> = new Map();
  private readonly sessionStates: Map<string, PlayerSessionState> = new Map();

  constructor(private readonly eventEmitter: EventEmitter2) {}

  markConnected(playerId: string, sessionId: string) {
    const now = Date.now();
    this.playerToSession.set(playerId, sessionId);
    this.sessionStates.set(playerId, {
      playerId,
      sessionId,
      connected: true,
      lastActive: now,
    });
    this.logger.log(`Player ${playerId} connected to session ${sessionId}`);
  }

  markDisconnected(playerId: string) {
    const state = this.sessionStates.get(playerId);
    if (state) {
      state.connected = false;
      state.disconnectedAt = Date.now();
      this.sessionStates.set(playerId, state);
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
      this.logger.log(`Heartbeat updated for player ${playerId}`);
    }
  }

  getPlayerStatus(playerId: string): PlayerSessionState | undefined {
    return this.sessionStates.get(playerId);
  }

  getSessionPlayers(sessionId: string): PlayerSessionState[] {
    return Array.from(this.sessionStates.values()).filter(
      (s) => s.sessionId === sessionId,
    );
  }
}
