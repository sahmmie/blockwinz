import { Module } from '@nestjs/common';
import { GameHistoryService } from './game-history.service';

@Module({
  providers: [GameHistoryService],
  exports: [GameHistoryService],
})
export class GameHistoryModule {}
