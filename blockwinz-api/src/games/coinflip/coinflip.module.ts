import { Module } from '@nestjs/common';
import { NeoCoreModule } from '../../core/neoCore/neoCore.module';
import { FairLogicModule } from '../../core/fairLogic/fairLogic.module';
import { CoinFlipController } from './controllers/coinflip.controller';
import { CoinFlipRepository } from './repositories/coinflip.repository';
import { CoinFlipService } from './coinflip.service';
import { TransactionModule } from 'src/transaction/transaction.module';
import { QueueModule } from 'src/core/queue/queue.module';
import { WalletModule } from 'src/wallet/wallet.module';
import { AuthenticationModule } from 'src/authentication/authentication.module';
import { BetHistoryModule } from 'src/betHistory/betHistory.module';
import { PricesModule } from 'src/prices/prices.module';

const controllers = [CoinFlipController];

const customModules = [
  NeoCoreModule,
  WalletModule,
  FairLogicModule,
  AuthenticationModule,
  QueueModule,
  TransactionModule,
];

@Module({
  imports: [BetHistoryModule, PricesModule, ...customModules],
  controllers: [...controllers],
  providers: [CoinFlipRepository, CoinFlipService],
  exports: [],
})
export class CoinFlipModule {}
