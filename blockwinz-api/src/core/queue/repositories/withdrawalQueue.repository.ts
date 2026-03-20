import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { UserRequestI } from 'src/shared/interfaces/userRequest.type';
import { TransactionDto } from 'src/transaction/dtos/transaction.dto';
import { WithdrawalDto } from 'src/withdrawal/dtos/withdrawal.dto';
import { WithdrawalQueueDto } from '../dtos/withdrawalQueue.dto';
import { WithdrawalStatus } from 'src/shared/enums/withdrawalStatus.enum';

@Injectable()
export class WithdrawalQueueRepository {
  private readonly logger = new Logger('Withdrawal Queue Repository');
  constructor(@InjectQueue('withdrawalQueue') private withdrawalQueue: Queue) {}

  /**
   *
   * @param user
   * @param amount
   * @returns
   * @description Queues a withdrawal operation for the specified user and amount.
   */
  public async queueWithdrawal(
    user: UserRequestI,
    transaction: TransactionDto,
    withdrawal: WithdrawalDto,
  ) {
    if (!withdrawal || withdrawal.status !== WithdrawalStatus.PENDING) {
      throw new Error('Invalid withdrawal request or already processed');
    }

    const jobId = `withdrawal-${withdrawal._id}`; // Unique identifier for the job

    const existingJob = await this.withdrawalQueue.getJob(jobId);
    if (existingJob) {
      this.logger.warn(
        `Withdrawal already queued for withdrawalId: ${withdrawal._id}`,
      );
      return;
    }

    this.logger.log(
      `Queueing withdrawal operation for user ${user._id}, amount ${withdrawal.amount}`,
    );
    await this.withdrawalQueue.add(
      'withdrawal',
      { user, transaction, withdrawal } as WithdrawalQueueDto,
      { jobId },
    );
  }
}
