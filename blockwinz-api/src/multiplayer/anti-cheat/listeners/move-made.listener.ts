import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { MultiplayerGameEmitterEvent } from '@blockwinz/shared';
import { AntiCheatService } from '../anti-cheat.service';

@Injectable()
export class MoveMadeListener {
  private readonly logger = new Logger(MoveMadeListener.name);
  private readonly FAST_MOVE_THRESHOLD_MS = 200;

  constructor(private readonly antiCheatService: AntiCheatService) {}

  @OnEvent(MultiplayerGameEmitterEvent.GAME_MOVE)
  handleMove(payload: {
    sessionId: string;
    playerId: string;
    move: any;
    gameState: any;
  }) {
    const { sessionId, playerId, move, gameState } = payload;
    console.log('Move made listener', payload, sessionId);

    // Fast move detection
    const now = Date.now();
    if (move.timestamp && now - move.timestamp < this.FAST_MOVE_THRESHOLD_MS) {
      this.antiCheatService.logSuspiciousGameEvent({
        userId: playerId,
        type: 'fast-move',
        gameId: gameState.gameId,
        reason: 'Move made too quickly',
        timestamp: now,
      });
    }
    // TODO: Add collusion and repeated matchup checks
  }
}
