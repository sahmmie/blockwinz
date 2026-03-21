import { Module } from '@nestjs/common';
import { NeoCoreModule } from '../../core/neoCore/neoCore.module';
import { LimboRepository } from './repositories/limbo.repository';
import { LimboService } from './limbo.service';
import { LimboController } from './controllers/limbo.controller';
import { FairLogicModule } from '../../core/fairLogic/fairLogic.module';
import { QueueModule } from 'src/core/queue/queue.module';
import { TransactionModule } from 'src/transaction/transaction.module';
import { WalletModule } from 'src/wallet/wallet.module';
import { AuthenticationModule } from 'src/authentication/authentication.module';
import { BetHistoryModule } from 'src/betHistory/betHistory.module';
import { PricesModule } from 'src/prices/prices.module';

const controllers = [LimboController];

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
  providers: [LimboRepository, LimboService],
  exports: [],
})
export class LimboModule {}
