import { forwardRef, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { WalletQueueRepository } from './repositories/walletQueue.repository';
import { WalletQueueProcessor } from './processors/walletQueue.processor';
import { BullBoardRepository } from './repositories/bullBoard.repository';
import { TransactionModule } from '../../transaction/transaction.module';
import { WalletModule } from 'src/wallet/wallet.module';
import { WithdrawalQueueRepository } from './repositories/withdrawalQueue.repository';
import { WithdrawalQueueProcessor } from './processors/withdrawalQueue.processor';
import { WithdrawalModule } from 'src/withdrawal/withdrawal.module';
import { EmailQueueProcessor } from './processors/emailQueue.processor';
import { EmailQueueRepository } from './repositories/emailQueue.repository';
import { EmailModule } from 'src/email/email.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'walletQueue', // Queue name
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        removeOnComplete: true,
        removeOnFail: false,
      },
    }),
    BullModule.registerQueue({
      name: 'withdrawalQueue', // Queue name
    }),
    BullModule.registerQueue({
      name: 'emailQueue',
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        removeOnComplete: true,
        removeOnFail: false,
      },
    }),
    TransactionModule,
    forwardRef(() => WalletModule),
    forwardRef(() => WithdrawalModule),
    forwardRef(() => EmailModule),
  ],
  providers: [
    WalletQueueProcessor,
    WalletQueueRepository,
    BullBoardRepository,
    WithdrawalQueueRepository,
    WithdrawalQueueProcessor,
    EmailQueueProcessor,
    EmailQueueRepository,
  ],
  exports: [
    WalletQueueRepository,
    WithdrawalQueueRepository,
    EmailQueueRepository,
  ],
})
export class QueueModule {}
