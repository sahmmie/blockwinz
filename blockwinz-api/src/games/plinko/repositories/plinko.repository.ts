import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { stringify } from 'flatted';
import {
  GetPlinkoResultRequestDto,
  GetPlinkoResultResponseDto,
} from '../dtos/plinko.dto';
import { multipliers } from '../muls';
import { FairLogicRepository } from 'src/core/fairLogic/repositories/fairLogic.repository';
import { DbGameSchema } from 'src/shared/enums/dbSchema.enum';
import { TransactionRepository } from 'src/transaction/repositories/transaction.repository';
import { BetHistoryRepository } from 'src/betHistory/repositories/betHistory.repository';
import { UserRequestI } from 'src/shared/interfaces/userRequest.type';
import { getUserId, getSeedId } from 'src/shared/helpers/user.helper';
import { FairLogicGenerateFloatsDto } from 'src/core/fairLogic/dtos/fairLogic.dto';
import { currencyData } from 'src/shared/constants/currency.constant';
import {
  TransactionStatus,
  TransactionType,
} from 'src/shared/enums/transaction.enums';
import { roundToDecimals } from 'src/shared/helpers/utils-functions.helper';
import { WalletRepository } from 'src/wallet/repositories/wallet.repository';
import { CHAIN } from 'src/shared/enums/currencies.enum';
import { DRIZZLE } from 'src/database/constants';
import type { DrizzleDb } from 'src/database/database.module';
import { plinkoGames } from 'src/database/schema/plinko-games';

@Injectable()
export class PlinkoRepository {
  private readonly logger = new Logger('Plinko Service');

  constructor(
    @Inject(DRIZZLE) private readonly db: DrizzleDb,
    private readonly fairLogicRepository: FairLogicRepository,
    private readonly transactionRepository: TransactionRepository,
    private readonly betHistoryRepository: BetHistoryRepository,
    private readonly walletRepository: WalletRepository,
  ) {}

  private generatePath(randomNumbers: number[]): number[] {
    return randomNumbers.map((num) => (num > 0.5 ? 1 : 0));
  }

  calculateMultiplier(path: number[], rows: number, risk: string): number {
    let position = path.reduce((acc, cur) => acc + cur, 0);
    position = Math.max(0, Math.min(position, rows));
    return multipliers[risk][rows][position];
  }

  async getPlinkoResult(
    player: UserRequestI,
    request: GetPlinkoResultRequestDto,
  ): Promise<GetPlinkoResultResponseDto> {
    return await this.db
      .transaction(async (tx) => {
        const txDb = tx as unknown as DrizzleDb;

        this.logger.log(
          `GetPlinkoResult Start Player ID: ${player._id} Bet amount: ${request.betAmount} Bet currency: ${request.currency} Risk: ${request.risk} Rows: ${request.rows}`,
        );

        const updatedPlayer = await this.fairLogicRepository.updatePlayerNonce(
          player,
          txDb,
        );

        await this.walletRepository.checkPlayerBalance(
          updatedPlayer,
          request.betAmount,
          request.currency,
          txDb,
        );

        const requestToGenerateFloats: FairLogicGenerateFloatsDto =
          this.fairLogicRepository.generateRequestsToFairLogic(
            updatedPlayer,
            request.rows,
            0,
          );

        const randomNumbers = this.fairLogicRepository.generateFloatsForGame(
          requestToGenerateFloats,
        );
        const path = this.generatePath(randomNumbers);
        const multiplier = this.calculateMultiplier(
          path,
          request.rows,
          request.risk,
        );

        const totalWinAmount = roundToDecimals(request.betAmount * multiplier);
        const theoreticalProfit = totalWinAmount - request.betAmount;
        if (theoreticalProfit > currencyData[request.currency].maxProfit) {
          throw new BadRequestException(
            `Profit must be less than ${currencyData[request.currency].maxProfit} for currency ${request.currency}`,
          );
        }

        const userId = getUserId(updatedPlayer);
        const seedId = getSeedId(updatedPlayer.activeSeed);

        const [gameRow] = await tx
          .insert(plinkoGames)
          .values({
            userId,
            seedId,
            betAmount: String(request.betAmount),
            totalWinAmount: String(totalWinAmount),
            currency: request.currency,
            multiplier: String(multiplier),
            nonce: updatedPlayer.nonce ?? 0,
            rows: request.rows,
            risk: request.risk,
            results: path,
            stopOnProfit:
              request.stopOnProfit != null
                ? String(request.stopOnProfit)
                : null,
            stopOnLoss:
              request.stopOnLoss != null ? String(request.stopOnLoss) : null,
            increaseBy:
              request.increaseBy != null ? String(request.increaseBy) : null,
            decreaseBy:
              request.decreaseBy != null ? String(request.decreaseBy) : null,
            isManualMode: request.isManualMode ?? false,
            isTurboMode: request.isTurboMode ?? false,
          } as typeof plinkoGames.$inferInsert)
          .returning();

        if (!gameRow) throw new Error('Failed to create plinko game');

        const gameId = gameRow.id;

        if (request.betAmount > 0) {
          await this.transactionRepository.createTransaction(
            updatedPlayer,
            request.betAmount,
            gameId,
            DbGameSchema.PlinkoGame,
            TransactionType.DEBIT,
            TransactionStatus.SETTLED,
            new Date(),
            CHAIN.SOLANA,
            request.currency,
            null,
            undefined,
            undefined,
            txDb,
          );
          await this.walletRepository.debitPlayer(
            updatedPlayer,
            request.betAmount,
            request.currency,
            txDb,
          );

          if (totalWinAmount > 0) {
            await this.transactionRepository.createTransaction(
              updatedPlayer,
              totalWinAmount,
              gameId,
              DbGameSchema.PlinkoGame,
              TransactionType.CREDIT,
              TransactionStatus.SETTLED,
              new Date(),
              CHAIN.SOLANA,
              request.currency,
              null,
              undefined,
              undefined,
              txDb,
            );
            await this.walletRepository.creditPlayer(
              updatedPlayer,
              totalWinAmount,
              request.currency,
              txDb,
            );
          }
        }

        await this.betHistoryRepository.createBetHistory(
          userId,
          gameId,
          DbGameSchema.PlinkoGame,
          request.betAmount,
          totalWinAmount,
          txDb,
        );

        return {
          results: path,
          multiplier,
          winAmount: totalWinAmount - request.betAmount,
        };
      })
      .catch((error) => {
        this.logger.error(`GetPlinkoResult Error: ${stringify(error)}`);
        throw error;
      });
  }
}
