import { Inject, Injectable } from '@nestjs/common';
import { BetHistoryRepository } from 'src/betHistory/repositories/betHistory.repository';
import { FairLogicRepository } from 'src/core/fairLogic/repositories/fairLogic.repository';
import { TransactionRepository } from 'src/transaction/repositories/transaction.repository';
import { WalletQueueRepository } from 'src/core/queue/repositories/walletQueue.repository';
import { DRIZZLE } from 'src/database/constants';
import type { DrizzleDb } from 'src/database/database.module';

@Injectable()
export class CoinflipRepository {
  constructor(
    @Inject(DRIZZLE) private readonly db: DrizzleDb,
    private readonly walletQueueRepository: WalletQueueRepository,
    private readonly fairLogicRepository: FairLogicRepository,
    private readonly transactionRepository: TransactionRepository,
    private readonly betHistoryRepository: BetHistoryRepository,
  ) {}
}
