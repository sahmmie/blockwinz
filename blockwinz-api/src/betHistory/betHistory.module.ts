import { Module } from '@nestjs/common';
import { BetHistoryController } from './controllers/betHistory.controller';
import { BetHistoryRepository } from './repositories/betHistory.repository';
import { BetHistoryService } from './betHistory.service';
import { RateLimitGuard } from 'src/shared/guards/rateLimit.guard';

const controllers = [BetHistoryController];

@Module({
  imports: [],
  controllers: [...controllers],
  providers: [BetHistoryRepository, BetHistoryService, RateLimitGuard],
  exports: [BetHistoryRepository, BetHistoryService],
})
export class BetHistoryModule {}
