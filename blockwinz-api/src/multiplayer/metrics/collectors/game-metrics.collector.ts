import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { MetricsService } from '../metrics.service';

@Injectable()
export class GameMetricsCollector {
  constructor(private readonly metricsService: MetricsService) {}

  @OnEvent('game.finished')
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

  @OnEvent('game.cancelled')
  handleGameCancelled() {
    this.metricsService.logGameAbandoned();
  }
}
