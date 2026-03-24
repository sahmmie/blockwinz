import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { DbGameSchema, MultiplayerGameEmitterEvent } from '@blockwinz/shared';
import { GameSessionService } from '../game-session.service';
import type { MatchRequest } from '../../matchmaking/match-request.interface';

/**
 * Opens a shared `game_sessions` row when Redis quick-match pairs two players.
 */
@Injectable()
export class MatchFoundListener {
  private readonly logger = new Logger(MatchFoundListener.name);

  constructor(
    private readonly sessionService: GameSessionService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @OnEvent(MultiplayerGameEmitterEvent.MATCH_FOUND)
  async handleMatchFound(payload: {
    player1: MatchRequest;
    player2: MatchRequest;
  }): Promise<void> {
    const { player1, player2 } = payload;
    this.logger.log(
      `Creating matched session for ${player1.userId} vs ${player2.userId}`,
    );
    try {
      const session = await this.sessionService.createMatchedSession({
        playerOneId: player1.userId,
        playerTwoId: player2.userId,
        gameType: player1.gameId as DbGameSchema,
        betAmount: player1.betAmount,
        currency: player1.currency,
      });
      this.eventEmitter.emit(MultiplayerGameEmitterEvent.MATCH_READY, {
        sessionId: session._id,
        gameType: session.gameType,
        playerIds: [player1.userId, player2.userId],
      });
    } catch (e) {
      this.logger.error('Failed to create session from match.found', e);
    }
  }
}
