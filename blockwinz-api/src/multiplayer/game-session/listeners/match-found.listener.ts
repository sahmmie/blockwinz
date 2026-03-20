import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { GameSessionService } from '../game-session.service';
import { MatchFoundEvent } from '../../matchmaking/events/match-found.event';

@Injectable()
export class MatchFoundListener {
  private readonly logger = new Logger(MatchFoundListener.name);

  constructor(private readonly sessionService: GameSessionService) {}

  @OnEvent('match.found')
  handleMatchFound(payload: MatchFoundEvent) {
    this.logger.log(`handleMatchFound: payload=${JSON.stringify(payload)}`);
    // const { player1, player2 } = payload;
    // const session = this.sessionService.createSession(
    //   player1.gameId,
    //   [player1.userId, player2.userId],
    //   player1.betAmount,
    // );
    // this.logger.log(
    //   `Game session created: ${session.sessionId} for players ${session.players.join(' vs ')}`,
    // );
  }
}
