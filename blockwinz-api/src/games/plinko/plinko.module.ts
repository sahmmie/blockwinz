import { Module } from '@nestjs/common';
import { NeoCoreModule } from '../../core/neoCore/neoCore.module';
import { FairLogicModule } from '../../core/fairLogic/fairLogic.module';
import { QueueModule } from 'src/core/queue/queue.module';
import { TransactionModule } from 'src/transaction/transaction.module';
import { WalletModule } from 'src/wallet/wallet.module';
import { AuthenticationModule } from 'src/authentication/authentication.module';
import { BetHistoryModule } from 'src/betHistory/betHistory.module';
import { PlinkoController } from './controllers/plinko.controller';
import { PlinkoRepository } from './repositories/plinko.repository';

const controllers = [PlinkoController];

const customModules = [
  NeoCoreModule,
  WalletModule,
  FairLogicModule,
  AuthenticationModule,
  QueueModule,
  TransactionModule,
];

@Module({
  imports: [BetHistoryModule, ...customModules],
  controllers: [...controllers],
  providers: [PlinkoRepository],
  exports: [],
})
export class PlinkoModule {}
