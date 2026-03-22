import { forwardRef, Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { DatabaseModule } from 'src/database/database.module';
import { WalletModule } from 'src/wallet/wallet.module';
import { GameHistoryModule } from '../game-history/game-history.module';
import { MultiplayerSettlementService } from './multiplayer-settlement.service';

@Module({
  imports: [
    DatabaseModule,
    EventEmitterModule,
    forwardRef(() => WalletModule),
    GameHistoryModule,
  ],
  providers: [MultiplayerSettlementService],
  exports: [MultiplayerSettlementService],
})
export class MultiplayerSettlementModule {}
