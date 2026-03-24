import { Injectable, Logger } from '@nestjs/common';
import { OnEvent, EventEmitter2 } from '@nestjs/event-emitter';
import { MultiplayerGameEmitterEvent } from '@blockwinz/shared';

@Injectable()
export class DisconnectionListener {
  private readonly logger = new Logger(DisconnectionListener.name);
  private readonly disconnectTimeouts: Map<string, NodeJS.Timeout> = new Map();
  private readonly TIMEOUT_MS = 15000; // 15 seconds

  constructor(private readonly eventEmitter: EventEmitter2) {}

  @OnEvent(MultiplayerGameEmitterEvent.PLAYER_DISCONNECTED)
  handlePlayerDisconnected(payload: { playerId: string; sessionId: string }) {
    const { playerId, sessionId } = payload;
    this.logger.warn(
      `Player ${playerId} disconnected from session ${sessionId}. Starting timeout...`,
    );
    // Start a timeout for possible forfeit/cancel
    const timeout = setTimeout(() => {
      this.logger.error(
        `Player ${playerId} did not reconnect in time. Cancelling session ${sessionId}.`,
      );
      this.eventEmitter.emit(MultiplayerGameEmitterEvent.GAME_CANCELLED, {
        sessionId,
        reason: 'player_disconnected',
        playerId,
      });
      this.disconnectTimeouts.delete(playerId);
    }, this.TIMEOUT_MS);
    this.disconnectTimeouts.set(playerId, timeout);
  }

  // Optionally, add a method to clear timeout if player reconnects
  clearTimeoutForPlayer(playerId: string) {
    const timeout = this.disconnectTimeouts.get(playerId);
    if (timeout) {
      clearTimeout(timeout);
      this.disconnectTimeouts.delete(playerId);
      this.logger.log(`Timeout cleared for player ${playerId}`);
    }
  }
}
