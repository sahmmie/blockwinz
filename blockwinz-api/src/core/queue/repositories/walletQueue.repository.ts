import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { UserRequestI } from 'src/shared/interfaces/userRequest.type';
import { TransactionDto } from 'src/transaction/dtos/transaction.dto';
import { Currency } from '@blockwinz/shared';

@Injectable()
export class WalletQueueRepository {
  private readonly logger = new Logger('Wallet Queue Service');
  constructor(@InjectQueue('walletQueue') private walletQueue: Queue) {}

  /**
   *
   * @param user
   * @param amount
   * @returns
   * @description Queues a debit operation for the specified user and amount.
   */
  public async queueDebit(
    user: UserRequestI,
    amount: number,
    currency: Currency,
    transaction: TransactionDto,
  ) {
    this.logger.log(
      `Queueing debit operation for user ${user._id}, amount ${amount}`,
    );
    await this.walletQueue.add('debit', {
      user,
      amount,
      currency,
      transaction,
    });
  }

  /**
   *
   * @param user
   * @param amount
   * @returns
   * @description Queues a credit operation for the specified user and amount.
   */
  public async queueCredit(
    user: UserRequestI,
    amount: number,
    currency: Currency,
    transaction: TransactionDto,
  ) {
    this.logger.log(
      `Queueing credit operation for user ${user._id}, amount ${amount}`,
    );
    await this.walletQueue.add('credit', {
      user,
      amount,
      currency,
      transaction,
    });
  }

  /**
   *
   * @param user
   * @returns
   * @description Queues an update wallet operation for the specified user.
   */
  public async queueUpdateWallet(user: UserRequestI) {
    const jobId = `wallet-${user._id}`;
    const existingJob = await this.walletQueue.getJob(jobId);

    if (existingJob) {
      const state = await existingJob.getState();

      // Optional: log state for debugging
      this.logger.warn(`Existing job for user ${user._id}: ${state}`);

      if (!['completed', 'failed'].includes(state)) {
        // Job still in progress or queued — skip
        return;
      }

      // Optionally remove old job to allow requeue
      await existingJob.remove();
    }

    await this.walletQueue.add('updateWallet', { user }, { jobId });
    this.logger.log(`Queued wallet update for user: ${user._id}`);
  }
}
