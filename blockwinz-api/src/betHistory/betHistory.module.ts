import { Module } from '@nestjs/common';
import { BetHistoryController } from './controllers/betHistory.controller';
import { BetHistoryRepository } from './repositories/betHistory.repository';

const controllers = [BetHistoryController];

@Module({
  imports: [],
  controllers: [...controllers],
  providers: [BetHistoryRepository],
  exports: [BetHistoryRepository],
})
export class BetHistoryModule {}
