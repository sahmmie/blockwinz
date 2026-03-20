import {
  Inject,
  Injectable,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { stringify } from 'flatted';
import { RollDiceWithGameTokenDto, DicesRoundEndDto } from '../dtos/dice.dto';
import { FairLogicRepository } from 'src/core/fairLogic/repositories/fairLogic.repository';
import { FairLogicGenerateFloatsDto } from 'src/core/fairLogic/dtos/fairLogic.dto';
import { UserRequestI } from 'src/shared/interfaces/userRequest.type';
import { getUserId, getSeedId } from 'src/shared/helpers/user.helper';
import { currencyData } from 'src/shared/constants/currency.constant';
import { DiceGameStatus, RollDirection } from '../enums/dice.enums';
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
import { diceGames } from 'src/database/schema/dice-games';

@Injectable()
export class DiceRepository {
  private readonly logger = new Logger(DiceRepository.name);
  private diceDataToGenerateFloats = { cursor: 0, count: 1 };

  constructor(
    @Inject(DRIZZLE) private readonly db: DrizzleDb,
    private readonly walletRepository: WalletRepository,
    private readonly fairLogicRepository: FairLogicRepository,
    private readonly transactionRepository: TransactionRepository,
    private readonly betHistoryRepository: BetHistoryRepository,
  ) {}

  async getDiceResult(
    request: RollDiceWithGameTokenDto,
    player: UserRequestI,
  ): Promise<DicesRoundEndDto> {
    return await this.db
      .transaction(async (tx) => {
        const txDb = tx as unknown as DrizzleDb;

        const updatedPlayer = await this.fairLogicRepository.updatePlayerNonce(
          player,
          txDb,
        );

        const truncatedBetTarget = Math.trunc(request.rollOverBet * 100) / 100;

        this.logger.log(
          `Start Dice Result | Player ID: ${updatedPlayer._id}, Bet: ${request.betAmount}, Nonce: ${updatedPlayer.nonce}`,
        );

        this.checkTheoreticalProfit(
          request.betAmount,
          truncatedBetTarget,
          request.direction,
          request.currency,
        );

        await this.walletRepository.checkPlayerBalance(
          updatedPlayer,
          request.betAmount,
          request.currency,
          txDb,
        );

        const resultFloat = this.generateDiceResultFloat(
          this.fairLogicRepository.generateRequestsToFairLogic(
            updatedPlayer,
            this.diceDataToGenerateFloats.count,
            this.diceDataToGenerateFloats.cursor,
          ),
        );

        const resultStatus = this.getDiceResultStatus(
          resultFloat,
          truncatedBetTarget,
          request.direction,
        );

        const totalWinAmount = this.calculateProfit(
          resultStatus,
          request.betAmount,
          truncatedBetTarget,
          request.direction,
        );

        const { multiplier } = this.calculateMultiplierAndChance(
          truncatedBetTarget,
          request.direction,
        );

        const userId = getUserId(updatedPlayer);
        const seedId = getSeedId(updatedPlayer.activeSeed);

        const [gameRow] = await tx
          .insert(diceGames)
          .values({
            userId,
            seedId,
            betAmount: String(request.betAmount),
            totalWinAmount:
              totalWinAmount != null ? String(totalWinAmount) : null,
            currency: request.currency,
            multiplier: String(multiplier),
            nonce: updatedPlayer.nonce ?? 0,
            rollOverBet: String(truncatedBetTarget),
            betResultFloat: String(resultFloat),
            betResultStatus: resultStatus,
            direction: request.direction,
          } as typeof diceGames.$inferInsert)
          .returning();

        if (!gameRow) throw new Error('Failed to create dice game');

        const gameId = gameRow.id;

        if (request.betAmount > 0) {
          await this.transactionRepository.createTransaction(
            updatedPlayer,
            request.betAmount,
            gameId,
            DbGameSchema.DiceGame,
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
              DbGameSchema.DiceGame,
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
          DbGameSchema.DiceGame,
          request.betAmount,
          totalWinAmount,
          txDb,
        );

        return {
          result: resultFloat,
          betResultStatus: resultStatus,
          target: truncatedBetTarget,
          totalWinAmount,
          multiplier,
        };
      })
      .catch((error) => {
        this.logger.error(`Dice Result Error: ${stringify(error)}`);
        throw error;
      });
  }

  private checkTheoreticalProfit(
    betAmount: number,
    rollOverBet: number,
    direction: RollDirection,
    currency: Currency,
  ) {
    const chance =
      direction === RollDirection.OVER ? 100 - rollOverBet : rollOverBet;
    const multiplier = 99 / chance;
    const theoreticalProfit = betAmount * multiplier - betAmount;

    if (theoreticalProfit > currencyData[currency].maxProfit) {
      throw new BadRequestException(
        `Profit must be less than ${currencyData[currency].maxProfit} for currency ${currency}`,
      );
    }
  }

  private generateDiceResultFloat(request: FairLogicGenerateFloatsDto): number {
    const resultFloat =
      (this.fairLogicRepository.generateFloatsForGame(request)[0] * 10_001) /
      100;
    const truncatedResult = Math.trunc(resultFloat * 100) / 100;
    this.logger.log(`Dice Result Float: ${truncatedResult}`);
    return truncatedResult;
  }

  private getDiceResultStatus(
    resultFloat: number,
    rollOverBet: number,
    direction: RollDirection,
  ): DiceGameStatus {
    return direction === RollDirection.OVER
      ? resultFloat > rollOverBet
        ? DiceGameStatus.WIN
        : DiceGameStatus.LOSE
      : resultFloat < rollOverBet
        ? DiceGameStatus.WIN
        : DiceGameStatus.LOSE;
  }

  private calculateProfit(
    resultStatus: DiceGameStatus,
    betAmount: number,
    rollOverBet: number,
    direction: RollDirection,
  ): number {
    const { multiplier } = this.calculateMultiplierAndChance(
      rollOverBet,
      direction,
    );
    return roundToDecimals(
      resultStatus === DiceGameStatus.WIN ? betAmount * multiplier : 0,
    );
  }

  private calculateMultiplierAndChance(
    rollOverBet: number,
    direction: RollDirection,
  ): { multiplier: number; chance: number } {
    const chance =
      direction === RollDirection.OVER ? 100 - rollOverBet : rollOverBet;
    const multiplier = Math.floor((99 / chance) * 100) / 100;
    return { multiplier, chance };
  }
}
