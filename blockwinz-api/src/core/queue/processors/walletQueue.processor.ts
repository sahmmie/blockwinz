import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { WalletQueueDto } from '../dtos/walletQueue.dto';
import { Logger } from '@nestjs/common';
import { TransactionRepository } from 'src/transaction/repositories/transaction.repository';
import { WalletRepository } from 'src/wallet/repositories/wallet.repository';
import { getUserId, getTransactionId } from 'src/shared/helpers/user.helper';

@Processor('walletQueue') // Processor bound to 'walletQueue'
export class WalletQueueProcessor {
  private readonly logger = new Logger('Wallet Queue Processor');

  constructor(
    private readonly walletRepository: WalletRepository,
    private readonly transactionRepository: TransactionRepository,
  ) {}

  @Process('debit')
  public async processDebit(job: Job<WalletQueueDto>) {
    const { user, amount, currency, transaction } = job.data;
    this.logger.log(
      `Processing debit for player ${getUserId(user)} with amount ${amount}`,
    );
    await this.walletRepository.debitPlayer(user, amount, currency);
    const transactionId = getTransactionId(transaction);
    if (transactionId) {
      const transactionFound =
        await this.transactionRepository.getTransactionById(transactionId);
      if (transactionFound) {
        transactionFound.onChain = true;
        transactionFound.fulfillmentDate = new Date();
        await this.transactionRepository.updateTransaction(transactionFound);
      }
    }
    this.logger.log(`Debit for user ${getUserId(user)} completed.`);
  }

  @Process('credit')
  public async processCredit(job: Job<WalletQueueDto>) {
    const { user, amount, currency, transaction } = job.data;
    this.logger.log(
      `Processing credit for user ${getUserId(user)} with amount ${amount}`,
    );
    await this.walletRepository.creditPlayer(user, amount, currency);
    const transactionId = getTransactionId(transaction);
    if (transactionId) {
      const transactionFound =
        await this.transactionRepository.getTransactionById(transactionId);
      if (transactionFound) {
        transactionFound.onChain = true;
        transactionFound.fulfillmentDate = new Date();
        await this.transactionRepository.updateTransaction(transactionFound);
      }
    }
    this.logger.log(`Credit for user ${getUserId(user)} completed.`);
  }

  @Process('updateWallet')
  public async processUpdateWallet(job: Job<WalletQueueDto>) {
    const { user } = job.data;
    this.logger.log(`Processing update wallet for user ${user.username}`);
    await this.walletRepository.getWalletBalances(user, true);
    this.logger.log(`Update wallet for user ${user.username} completed.`);
  }
}
