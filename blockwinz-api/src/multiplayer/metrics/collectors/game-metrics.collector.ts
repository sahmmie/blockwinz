import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { MultiplayerGameEmitterEvent } from '@blockwinz/shared';
import { MetricsService } from '../metrics.service';

@Injectable()
export class GameMetricsCollector {
  constructor(private readonly metricsService: MetricsService) {}

  @OnEvent(MultiplayerGameEmitterEvent.GAME_FINISHED)
  handleGameFinished(payload: {
    sessionId: string;
    winner: string | null;
    finalState: any;
  }) {
    const { winner, finalState } = payload;
    this.metricsService.logGamePlayed(finalState.players);
    if (winner) {
      this.metricsService.logWin(winner);
    }
  }

  @OnEvent(MultiplayerGameEmitterEvent.GAME_CANCELLED)
  handleGameCancelled() {
    this.metricsService.logGameAbandoned();
  }
}
