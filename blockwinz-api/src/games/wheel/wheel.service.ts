import {
  Inject,
  Injectable,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { stringify } from 'flatted';
import { SpinWheelDto, SpinWheelResponseDto } from './dtos/wheel.dto';
import { Currency } from '@blockwinz/shared';
import { FairLogicRepository } from 'src/core/fairLogic/repositories/fairLogic.repository';
import { DbGameSchema } from '@blockwinz/shared';
import { TransactionRepository } from 'src/transaction/repositories/transaction.repository';
import { BetHistoryRepository } from 'src/betHistory/repositories/betHistory.repository';
import { currencyData } from 'src/shared/constants/currency.constant';
import { UserRequestI } from 'src/shared/interfaces/userRequest.type';
import { getUserId, getSeedId } from 'src/shared/helpers/user.helper';
import { SeedDto } from 'src/core/seeds /dtos/seeds.dto';
import { multipliersRecords } from './multipliers';
import {
  TransactionStatus,
  TransactionType,
} from '@blockwinz/shared';
import { WalletRepository } from 'src/wallet/repositories/wallet.repository';
import { CHAIN } from '@blockwinz/shared';
import { DRIZZLE } from 'src/database/constants';
import type { DrizzleDb } from 'src/database/database.module';
import { wheelGames } from 'src/database/schema/wheel-games';
import { WheelRepository } from './repositories/wheel.repository';

@Injectable()
export class WheelService {
  private readonly logger = new Logger(WheelService.name);

  constructor(
    @Inject(DRIZZLE) private readonly db: DrizzleDb,
    private readonly fairLogicRepository: FairLogicRepository,
    private readonly transactionRepository: TransactionRepository,
    private readonly betHistoryRepository: BetHistoryRepository,
    private readonly walletRepository: WalletRepository,
    private readonly wheelRepository: WheelRepository,
  ) {}

  async spin(player: UserRequestI, request: SpinWheelDto) {
    return await this.db
      .transaction(async (tx) => {
        const txDb = tx as unknown as DrizzleDb;

        this.logger.log(`GetWheelResult Request ${stringify(request)}`);

        const updatedPlayer = await this.fairLogicRepository.updatePlayerNonce(
          player,
          txDb,
        );

        const float = this.fairLogicRepository.generateFloatsForGame({
          cursor: 0,
          count: 1,
          nonce: updatedPlayer.nonce ?? 0,
          clientSeed: (updatedPlayer.activeSeed as SeedDto).clientSeed,
          serverSeed: (updatedPlayer.activeSeed as SeedDto).serverSeed,
        });
        const multiplier = this.generateSegmentMultiplierResult(
          float[0],
          request.risk,
          request.segments,
        );
        this.checkTheoreticalProfit(
          request.betAmount,
          multiplier,
          request.currency,
        );

        await this.walletRepository.checkPlayerBalance(
          updatedPlayer,
          request.betAmount,
          request.currency,
          txDb,
        );

        const totalWinAmount = this.calculateWinAmount(
          request.betAmount,
          multiplier,
          request.currency,
        );

        const userId = getUserId(updatedPlayer);
        const seedId = getSeedId(updatedPlayer.activeSeed);

        const gameRow = await this.wheelRepository.insertWheelGame(txDb, {
          userId,
          seedId,
          betAmount: String(request.betAmount),
          totalWinAmount: String(totalWinAmount),
          currency: request.currency,
          multiplier: String(multiplier),
          nonce: updatedPlayer.nonce ?? 0,
          risk: request.risk,
          segments: request.segments,
          betResultStatus: null,
          betResultNumber: null,
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
        } as typeof wheelGames.$inferInsert);

        const gameId = gameRow.id;

        if (request.betAmount > 0) {
          await this.transactionRepository.createTransaction(
            updatedPlayer,
            request.betAmount,
            gameId,
            DbGameSchema.WheelGame,
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
              DbGameSchema.WheelGame,
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
          DbGameSchema.WheelGame,
          request.betAmount,
          totalWinAmount,
          request.currency,
          multiplier,
          txDb,
        );

        return this.getGameResponseFromRow(gameRow, request, totalWinAmount);
      })
      .catch((error) => {
        this.logger.error(`GetWheelResult Error ${stringify(error)}`);
        throw error;
      });
  }

  private getGameResponseFromRow(
    row: typeof wheelGames.$inferSelect,
    request: SpinWheelDto,
    totalWinAmount: number,
  ): SpinWheelResponseDto {
    return {
      risk: row.risk,
      segments: row.segments,
      multiplier: Number(row.multiplier),
      betAmount: request.betAmount,
      currency: row.currency as Currency,
      stopOnLoss: request.stopOnLoss,
      decreaseBy: request.decreaseBy,
      increaseBy: request.increaseBy,
      isManualMode: request.isManualMode,
      stopOnProfit: request.stopOnProfit,
      isTurboMode: request.isTurboMode,
      totalWinAmount,
    };
  }

  private generateSegmentMultiplierResult(
    float: number,
    risk: string,
    segmentCount: number,
  ) {
    const mults = multipliersRecords[risk][segmentCount];
    const multiplierIndex = Math.floor(float * mults.length);
    return mults[multiplierIndex];
  }

  private calculateWinAmount(
    betAmount: number,
    multiplier: number,
    betCurrency: string,
  ) {
    const profit = betAmount * multiplier - betAmount;
    const maxProfit = currencyData[betCurrency].maxProfit;
    if (profit > maxProfit) {
      return maxProfit + betAmount;
    }
    return profit + betAmount;
  }

  private checkTheoreticalProfit(
    betAmount: number,
    multiplier: number,
    currency: string,
  ) {
    const profit = betAmount * multiplier - betAmount;
    if (profit > currencyData[currency].maxProfit) {
      throw new BadRequestException(
        `Profit must be less than ${currencyData[currency].maxProfit} for currency ${currency}`,
      );
    }
  }
}
