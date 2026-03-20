import { Module } from '@nestjs/common';
import { NeoCoreModule } from '../../core/neoCore/neoCore.module';
import { FairLogicModule } from '../../core/fairLogic/fairLogic.module';
import { DicesController } from './controllers/dice.controller';
import { DiceRepository } from './repositories/dice.repository';
import { TransactionModule } from 'src/transaction/transaction.module';
import { QueueModule } from 'src/core/queue/queue.module';
import { WalletModule } from 'src/wallet/wallet.module';
import { AuthenticationModule } from 'src/authentication/authentication.module';
import { BetHistoryModule } from 'src/betHistory/betHistory.module';

const controllers = [DicesController];

const customModules = [
  NeoCoreModule,
  WalletModule,
  FairLogicModule,
  AuthenticationModule,
  TransactionModule,
  QueueModule,
];

@Module({
  imports: [...customModules, BetHistoryModule],
  controllers: [...controllers],
  providers: [DiceRepository],
  exports: [],
})
export class DiceModule {}
