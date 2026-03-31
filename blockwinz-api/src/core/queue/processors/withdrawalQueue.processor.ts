import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { Inject, InternalServerErrorException, Logger } from '@nestjs/common';
import { TransactionRepository } from 'src/transaction/repositories/transaction.repository';
import { WalletRepository } from 'src/wallet/repositories/wallet.repository';
import { WithdrawalRepository } from 'src/withdrawal/repositories/withdrawal.repository';
import { WithdrawalQueueDto } from '../dtos/withdrawalQueue.dto';
import { TransactionStatus } from '@blockwinz/shared';
import { getTransactionId } from 'src/shared/helpers/user.helper';
import { WithdrawalStatus } from '@blockwinz/shared';
import { DRIZZLE } from 'src/database/constants';
import type { DrizzleDb } from 'src/database/database.module';

@Processor('withdrawalQueue')
export class WithdrawalQueueProcessor {
  private readonly logger = new Logger('Withdrawal Queue Processor');

  constructor(
    @Inject(DRIZZLE) private readonly db: DrizzleDb,
    private readonly walletRepository: WalletRepository,
    private readonly transactionRepository: TransactionRepository,
    private readonly withdrawalRepository: WithdrawalRepository,
  ) {}

  @Process('withdrawal')
  public async processWithdrawal(job: Job<WithdrawalQueueDto>) {
    const { user, transaction, withdrawal } = job.data;
    let payoutSignature: string | undefined;
    try {
      const transactionFound =
        await this.transactionRepository.getTransactionById(
          getTransactionId(transaction),
        );
      const withdrawalFound =
        await this.withdrawalRepository.requireWithdrawalByRequestId(
          withdrawal.requestId,
        );
      if (!withdrawalFound || !transactionFound) {
        throw new InternalServerErrorException(
          'Fatal Error: Withdrawal not found or transaction not found',
        );
      }
      this.logger.log(
        `Processing Withdrawal for user ${user.username} with amount ${withdrawal.amount}`,
      );
      if (
        transactionFound.status === TransactionStatus.SETTLED &&
        withdrawalFound.status === WithdrawalStatus.COMPLETED
      ) {
        this.logger.log(
          `Withdrawal ${withdrawal.requestId} already settled; skipping duplicate processing.`,
        );
        return;
      }

      payoutSignature = withdrawalFound.transactionHash ?? transactionFound.txid;

      if (!payoutSignature) {
        payoutSignature = await this.walletRepository.withdrawFunds(
          user,
          withdrawal.amount,
          withdrawal.currency,
          withdrawal.destinationAddress,
        );

        transactionFound.onChain = true;
        transactionFound.txid = payoutSignature;
        const markerResults = await Promise.allSettled([
          this.transactionRepository.updateTransaction(transactionFound),
          this.withdrawalRepository.updateWithdrawal(withdrawal.requestId, {
            transactionHash: payoutSignature,
            error: null,
          }),
        ]);
        if (markerResults.every((result) => result.status === 'rejected')) {
          throw new InternalServerErrorException(
            'Chain payout sent but reconciliation marker could not be persisted',
          );
        }
      }

      await this.db.transaction(async (tx) => {
        const txDb = tx as unknown as DrizzleDb;
        await this.walletRepository.debitPlayer(
          user,
          withdrawalFound.amount,
          withdrawalFound.currency,
          txDb,
        );
        await this.walletRepository.releaseWithdrawalFunds(
          user,
          withdrawalFound.amount,
          withdrawalFound.currency,
          txDb,
        );
        transactionFound.onChain = true;
        transactionFound.txid = payoutSignature;
        transactionFound.fulfillmentDate = new Date();
        transactionFound.status = TransactionStatus.SETTLED;
        await this.transactionRepository.updateTransaction(transactionFound, txDb);
        await this.withdrawalRepository.updateWithdrawal(
          withdrawal.requestId,
          {
            status: WithdrawalStatus.COMPLETED,
            transactionHash: payoutSignature,
            processedAt: new Date(),
            error: null,
          },
          txDb,
        );
      });
      this.logger.log(`Withdrawal for user ${user.username} completed.`);
    } catch (error) {
      this.logger.error(
        `Error processing withdrawal for user ${user.username}: ${error}`,
      );
      const transactionFound =
        await this.transactionRepository.getTransactionById(
          getTransactionId(transaction),
        );
      const withdrawalFound =
        await this.withdrawalRepository.requireWithdrawalByRequestId(
          withdrawal.requestId,
        );
      if (payoutSignature || withdrawalFound.transactionHash || transactionFound?.txid) {
        this.logger.error(
          `Withdrawal ${withdrawal.requestId} requires reconciliation after chain payout.`,
        );
        throw error;
      }
      await this.db.transaction(async (tx) => {
        const txDb = tx as unknown as DrizzleDb;
        if (transactionFound) {
          transactionFound.status = TransactionStatus.FAILED;
          transactionFound.txid = null;
          transactionFound.fulfillmentDate = null;
          await this.transactionRepository.updateTransaction(transactionFound, txDb);
        }
        await this.withdrawalRepository.updateWithdrawal(withdrawal.requestId, {
          status: WithdrawalStatus.FAILED,
          error: error instanceof Error ? error.message : String(error),
          processedAt: new Date(),
        }, txDb);
        await this.walletRepository.releaseWithdrawalFunds(
          user,
          withdrawalFound.amount,
          withdrawalFound.currency,
          txDb,
        );
      });
      this.logger.error(`Withdrawal for user ${user.username} failed.`);
      throw error;
    }
  }
}
