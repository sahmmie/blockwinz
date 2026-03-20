import { Module } from '@nestjs/common';
import { TicTacToeRepository } from './repositories/tictactoe.repository';
import { TictactoeController } from './controllers/tictactoe.controller';
import { QueueModule } from 'src/core/queue/queue.module';
import { TransactionModule } from 'src/transaction/transaction.module';
import { WalletModule } from 'src/wallet/wallet.module';
import { BetHistoryModule } from 'src/betHistory/betHistory.module';
import { DatabaseModule } from 'src/database/database.module';
import { FairLogicModule } from 'src/core/fairLogic/fairLogic.module';

const controllers = [TictactoeController];

const customModules = [
  DatabaseModule,
  WalletModule,
  QueueModule,
  TransactionModule,
  FairLogicModule,
];

@Module({
  imports: [BetHistoryModule, ...customModules],
  controllers: [...controllers],
  providers: [TicTacToeRepository],
  exports: [],
})
export class TicTacToeModule {}
