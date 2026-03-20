import { Module } from '@nestjs/common';
import { PayoutService } from './payout.service';
import { GameFinishedListener } from './listeners/game-finished.listener';

@Module({
  providers: [PayoutService, GameFinishedListener],
  exports: [PayoutService],
})
export class PayoutModule {}
