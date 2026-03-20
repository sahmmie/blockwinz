import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { stringify } from 'flatted';
import {
  GetLimboResultRequestDto,
  GetLimboResultResponseDto,
} from './dto/getLimboResult.dto';
import { LimboGameStatus } from './enums/limbo.enums';
import { FairLogicRepository } from 'src/core/fairLogic/repositories/fairLogic.repository';
import { FairLogicGenerateFloatsDto } from 'src/core/fairLogic/dtos/fairLogic.dto';
import { currencyData } from 'src/shared/constants/currency.constant';
import { UserRequestI } from 'src/shared/interfaces/userRequest.type';
import { getUserId, getSeedId } from 'src/shared/helpers/user.helper';
import { TransactionRepository } from 'src/transaction/repositories/transaction.repository';
import {
  TransactionStatus,
  TransactionType,
} from 'src/shared/enums/transaction.enums';
import { DbGameSchema } from 'src/shared/enums/dbSchema.enum';
import { BetHistoryRepository } from 'src/betHistory/repositories/betHistory.repository';
import { roundToDecimals } from 'src/shared/helpers/utils-functions.helper';
import { CHAIN, Currency } from 'src/shared/enums/currencies.enum';
import { WalletRepository } from 'src/wallet/repositories/wallet.repository';
import { DRIZZLE } from 'src/database/constants';
import type { DrizzleDb } from 'src/database/database.module';
import { limboGames } from 'src/database/schema/limbo-games';
import { LimboRepository } from './repositories/limbo.repository';

@Injectable()
export class LimboService {
  private readonly logger = new Logger(LimboService.name);
  private limboDataToGenerateFloats = { cursor: 0, count: 1 };

  constructor(
    @Inject(DRIZZLE) private readonly db: DrizzleDb,
    private readonly fairLogicRepository: FairLogicRepository,
    private readonly transactionRepository: TransactionRepository,
    private readonly betHistoryRepository: BetHistoryRepository,
    private readonly walletRepository: WalletRepository,
    private readonly limboRepository: LimboRepository,
  ) {}

  async getLimboResult(
    request: GetLimboResultRequestDto,
    player: UserRequestI,
  ): Promise<GetLimboResultResponseDto> {
    return await this.db
      .transaction(async (tx) => {
        const txDb = tx as unknown as DrizzleDb;

        this.logger.log(
          `GetLimboResult Start Player ID: ${player._id} Bet amount: ${request.betAmount} Bet currency: ${request.currency} Bet multiplier: ${request.multiplier}`,
        );

        this.checkTheoreticalProfit(
          request.betAmount,
          request.multiplier,
          request.currency,
        );

        const updatedPlayer = await this.fairLogicRepository.updatePlayerNonce(
          player,
          txDb,
        );
        this.logger.log(
          `GetLimboResult Player ID: ${updatedPlayer._id} Nonce: ${updatedPlayer.nonce}`,
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
            this.limboDataToGenerateFloats.count,
            this.limboDataToGenerateFloats.cursor,
          );
        const result = this.generateLimboResultNumber(requestToGenerateFloats);
        const resultStatus = this.getLimboGameStatus(
          result,
          request.multiplier,
        );

        const totalWinAmount = this.calculateProfit(
          resultStatus,
          request.betAmount,
          request.multiplier,
        );

        const userId = getUserId(updatedPlayer);
        const seedId = getSeedId(updatedPlayer.activeSeed);

        const gameRow = await this.limboRepository.insertLimboGame(txDb, {
          userId,
          seedId,
          betAmount: String(request.betAmount),
          totalWinAmount:
            totalWinAmount != null ? String(totalWinAmount) : null,
          currency: request.currency,
          multiplier: String(request.multiplier),
          nonce: updatedPlayer.nonce ?? 0,
          betResultNumber: String(result),
          betResultStatus: resultStatus,
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
        } as typeof limboGames.$inferInsert);

        const gameId = gameRow.id;

        if (request.betAmount > 0) {
          await this.transactionRepository.createTransaction(
            updatedPlayer,
            request.betAmount,
            gameId,
            DbGameSchema.LimboGame,
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
              DbGameSchema.LimboGame,
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
          DbGameSchema.LimboGame,
          request.betAmount,
          totalWinAmount,
          request.currency,
          request.multiplier,
          txDb,
        );

        return {
          result,
          betResultStatus: resultStatus,
          totalWinAmount,
        };
      })
      .catch((error) => {
        this.logger.error(`GetLimboResult Error: ${stringify(error)}`);
        throw error;
      });
  }

  private checkTheoreticalProfit(
    betAmount: number,
    multiplier: number,
    currency: Currency,
  ) {
    const theoreticalProfit = betAmount * multiplier - betAmount;
    if (theoreticalProfit > currencyData[currency].maxProfit) {
      throw new BadRequestException(
        `Profit must be less than ${currencyData[currency].maxProfit} for currency ${currency}`,
      );
    }
  }

  private calculateProfit(
    resultStatus: LimboGameStatus,
    betAmount: number,
    multiplier: number,
  ): number {
    return roundToDecimals(
      resultStatus === LimboGameStatus.WIN ? betAmount * multiplier : 0,
    );
  }

  private generateLimboResultNumber(request: FairLogicGenerateFloatsDto): number {
    const limboOutcome =
      this.fairLogicRepository.generateFloatsForGame(request);
    const floatPoint = (1e8 / (limboOutcome[0] * 1e8)) * 0.99;
    const crashPoint = Math.floor(floatPoint * 100) / 100;
    const result = Math.max(crashPoint, 1);
    this.logger.debug(`GetLimboResult Result: ${result}`);
    return result;
  }

  private getLimboGameStatus(
    result: number,
    targetMultiplier: number,
  ): LimboGameStatus {
    this.logger.debug(
      `Calculating game status. Result: ${result}, Target Multiplier: ${targetMultiplier}`,
    );
    return result >= targetMultiplier
      ? LimboGameStatus.WIN
      : LimboGameStatus.LOSE;
  }
}
