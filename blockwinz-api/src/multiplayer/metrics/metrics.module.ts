import { Module } from '@nestjs/common';
import { MetricsService } from './metrics.service';
import { GameMetricsCollector } from './collectors/game-metrics.collector';

@Module({
  providers: [MetricsService, GameMetricsCollector],
  exports: [MetricsService],
})
export class MetricsModule {}
