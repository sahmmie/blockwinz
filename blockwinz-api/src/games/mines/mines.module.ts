import { Module } from '@nestjs/common';
import { MinesController } from './controllers/mines.controller';
import { QueueModule } from 'src/core/queue/queue.module';
import { TransactionModule } from 'src/transaction/transaction.module';
import { WalletModule } from 'src/wallet/wallet.module';
import { BetHistoryModule } from 'src/betHistory/betHistory.module';
import { MinesRepository } from './repositories/mines.repository';
import { FairLogicModule } from 'src/core/fairLogic/fairLogic.module';
import { AuthenticationModule } from 'src/authentication/authentication.module';
import { DatabaseModule } from 'src/database/database.module';

const controllers = [MinesController];

const customModules = [
  DatabaseModule,
  WalletModule,
  QueueModule,
  TransactionModule,
  FairLogicModule,
  AuthenticationModule,
];

@Module({
  imports: [BetHistoryModule, ...customModules],
  controllers: [...controllers],
  providers: [MinesRepository],
  exports: [],
})
export class MinesModule {}
