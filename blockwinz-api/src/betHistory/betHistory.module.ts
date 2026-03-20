import { Module } from '@nestjs/common';
import { BetHistoryController } from './controllers/betHistory.controller';
import { BetHistoryRepository } from './repositories/betHistory.repository';
import { BetHistoryService } from './betHistory.service';

const controllers = [BetHistoryController];

@Module({
  imports: [],
  controllers: [...controllers],
  providers: [BetHistoryRepository, BetHistoryService],
  exports: [BetHistoryRepository, BetHistoryService],
})
export class BetHistoryModule {}
