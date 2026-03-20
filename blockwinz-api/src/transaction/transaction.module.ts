import { TransactionController } from './controllers/transaction.controller';
import { Module } from '@nestjs/common';
import { TransactionRepository } from './repositories/transaction.repository';

const controllers = [TransactionController];

@Module({
  imports: [],
  controllers: [...controllers],
  providers: [TransactionRepository],
  exports: [TransactionRepository],
})
export class TransactionModule {}
