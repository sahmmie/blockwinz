import { Injectable, Logger } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PlayerSessionTrackerService } from '../player-session-tracker.service';

@Injectable()
export class AfkListener {
  private readonly logger = new Logger(AfkListener.name);
  private readonly AFK_THRESHOLD_MS = 30000; // 30 seconds

  constructor(
    private readonly tracker: PlayerSessionTrackerService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @Interval(10000) // Check every 10 seconds
  checkForAfkPlayers() {
    const now = Date.now();
    const allStates = Array.from(this.tracker['sessionStates'].values());
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
