import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { stringify } from 'flatted';
import {
  GetCoinFlipResultDto,
  GetCoinFlipResultResponseDto,
} from './dtos/coinflip.dto';
import { CoinFlipGameStatus } from './enums/coinflip.enums';
import { FairLogicRepository } from 'src/core/fairLogic/repositories/fairLogic.repository';
import { FairLogicGenerateFloatsDto } from 'src/core/fairLogic/dtos/fairLogic.dto';
import { currencyData } from 'src/shared/constants/currency.constant';
import { UserRequestI } from 'src/shared/interfaces/userRequest.type';
import { getUserId, getSeedId } from 'src/shared/helpers/user.helper';
import { TransactionRepository } from 'src/transaction/repositories/transaction.repository';
import { TransactionStatus, TransactionType } from '@blockwinz/shared';
import { DbGameSchema } from '@blockwinz/shared';
import { BetHistoryRepository } from 'src/betHistory/repositories/betHistory.repository';
import { roundToDecimals } from 'src/shared/helpers/utils-functions.helper';
import { CHAIN, Currency } from '@blockwinz/shared';
import { WalletRepository } from 'src/wallet/repositories/wallet.repository';
import { stakeAuditFromRequest } from 'src/shared/utils/stake-audit.util';
import { DRIZZLE } from 'src/database/constants';
import type { DrizzleDb } from 'src/database/database.module';
import { coinflipGames } from 'src/database/schema/coinflip-games';
import { CoinFlipRepository } from './repositories/coinflip.repository';

/** `coinflip_games.risk` is required by schema; the game has no risk modes yet. */
const COINFLIP_RISK_PLACEHOLDER = 'standard';

/** Orchestrates provably fair coin flip rounds: fairness, Postgres game row, wallet, and bet history. */
@Injectable()
export class CoinFlipService {
  private readonly logger = new Logger(CoinFlipService.name);

  constructor(
    @Inject(DRIZZLE) private readonly db: DrizzleDb,
    private readonly fairLogicRepository: FairLogicRepository,
    private readonly transactionRepository: TransactionRepository,
    private readonly betHistoryRepository: BetHistoryRepository,
    private readonly walletRepository: WalletRepository,
    private readonly coinFlipRepository: CoinFlipRepository,
  ) {}

  /**
   * Runs one provably fair coin flip round: nonce bump, balance check, outcome, ledger, bet history.
   *
   * @param request - Bet and game parameters (coins, min, coinType, stake fields)
   * @param player - Authenticated user from JWT
   * @returns Per-coin results, payout multiplier, and win/lose status
   */
  async getCoinFlipResult(
    request: GetCoinFlipResultDto,
    player: UserRequestI,
  ): Promise<GetCoinFlipResultResponseDto> {
    this.validateRequest(request);

    return await this.db
      .transaction(async (tx) => {
        const txDb = tx as unknown as DrizzleDb;

        this.logger.log(
          `GetCoinFlipResult Start Player ID: ${player._id} betAmount: ${request.betAmount} currency: ${request.currency} coins: ${request.coins} min: ${request.min}`,
        );

        this.checkTheoreticalProfit(
          request.betAmount,
          request.coins,
          request.min,
          request.currency,
        );

        const updatedPlayer = await this.fairLogicRepository.updatePlayerNonce(
          player,
          txDb,
        );
        this.logger.log(
          `GetCoinFlipResult Player ID: ${updatedPlayer._id} Nonce: ${updatedPlayer.nonce}`,
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
            request.coins,
            0,
          );
        const resultFloats = this.fairLogicRepository.generateFloatsForGame(
          requestToGenerateFloats,
        );
        const results = resultFloats.map((num) => (num > 0.5 ? 1 : 0));
        const isWin =
          results.filter((r) => r === request.coinType).length >= request.min;
        const multiplier = isWin
          ? this.calculateMultiplier(request.coins, request.min)
          : 0;
        const status = isWin ? CoinFlipGameStatus.WIN : CoinFlipGameStatus.LOSE;

        const totalWinAmount = roundToDecimals(
          isWin ? request.betAmount * multiplier : 0,
        );

        const userId = getUserId(updatedPlayer);
        const seedId = getSeedId(updatedPlayer.activeSeed);

        const gameRow = await this.coinFlipRepository.insertCoinFlipGame(txDb, {
          userId,
          seedId,
          betAmount: String(request.betAmount),
          totalWinAmount: String(totalWinAmount),
          currency: request.currency,
          multiplier: String(multiplier),
          nonce: updatedPlayer.nonce ?? 0,
          risk: COINFLIP_RISK_PLACEHOLDER,
          coins: request.coins,
          side: request.coinType,
          min: request.min,
          results,
          betResultStatus: status,
          stopOnProfit:
            request.stopOnProfit != null ? String(request.stopOnProfit) : null,
          stopOnLoss:
            request.stopOnLoss != null ? String(request.stopOnLoss) : null,
          increaseBy:
            request.increaseBy != null ? String(request.increaseBy) : null,
          decreaseBy:
            request.decreaseBy != null ? String(request.decreaseBy) : null,
          isManualMode: request.isManualMode ?? false,
          isTurboMode: request.isTurboMode ?? false,
        } as typeof coinflipGames.$inferInsert);

        const gameId = gameRow.id;

        if (request.betAmount > 0) {
          await this.transactionRepository.createTransaction(
            updatedPlayer,
            request.betAmount,
            gameId,
            DbGameSchema.CoinFlipGame,
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
              DbGameSchema.CoinFlipGame,
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
          DbGameSchema.CoinFlipGame,
          request.betAmount,
          totalWinAmount,
          request.currency,
          multiplier,
          txDb,
          stakeAuditFromRequest(request),
        );

        return {
          results,
          multiplier,
          betResultStatus: status,
        };
      })
      .catch((error) => {
        this.logger.error(`GetCoinFlipResult Error: ${stringify(error)}`);
        throw error;
      });
  }

  /**
   * Validates coins/min/coinType rules beyond class-validator.
   *
   * @param request - Incoming play request
   * @throws BadRequestException when parameters are inconsistent
   */
  private validateRequest(request: GetCoinFlipResultDto): void {
    const { coins, min } = request;
    if (min < 1 || min > coins) {
      throw new BadRequestException('Invalid request parameters');
    }
    if (coins >= 6 && coins <= 8 && min < 2) {
      throw new BadRequestException('Invalid request parameters');
    }
    if (coins >= 9 && coins <= 10 && min < 3) {
      throw new BadRequestException('Invalid request parameters');
    }
  }

  /**
   * Ensures the best-case payout for this configuration is within currency max profit.
   *
   * @param betAmount - Stake size
   * @param coins - Number of coin flips
   * @param minRequired - Minimum matching faces to win
   * @param currency - Stake currency
   * @throws BadRequestException when theoretical profit exceeds the cap
   */
  private checkTheoreticalProfit(
    betAmount: number,
    coins: number,
    minRequired: number,
    currency: Currency,
  ): void {
    const winProb = this.calculateWinProbability(coins, minRequired);
    const fairMultiplier = 1 / winProb;
    const theoreticalProfit = betAmount * fairMultiplier - betAmount;

    if (theoreticalProfit > currencyData[currency].maxProfit) {
      throw new BadRequestException(
        `Profit must be less than ${currencyData[currency].maxProfit} for currency ${currency}`,
      );
    }
  }

  /** Binomial probability mass at k successes in n trials with success probability p. */
  private calculateBinomialProbability(
    n: number,
    k: number,
    p: number = 0.5,
  ): number {
    const combinations =
      this.factorial(n) / (this.factorial(k) * this.factorial(n - k));
    return combinations * Math.pow(p, k) * Math.pow(1 - p, n - k);
  }

  /** Factorial for small n (coins ≤ 10). */
  private factorial(n: number): number {
    if (n === 0 || n === 1) return 1;
    return n * this.factorial(n - 1);
  }

  /** Probability of at least `minRequired` heads when each flip is fair 50/50. */
  private calculateWinProbability(coins: number, minRequired: number): number {
    let winProb = 0;
    for (let i = minRequired; i <= coins; i++) {
      winProb += this.calculateBinomialProbability(coins, i);
    }
    return winProb;
  }

  /**
   * RTP-adjusted payout multiplier when the player wins.
   *
   * @param coins - Number of flips
   * @param minRequired - Minimum matches needed
   * @param rtp - House edge factor (default 0.99)
   */
  private calculateMultiplier(
    coins: number,
    minRequired: number,
    rtp: number = 0.99,
  ): number {
    const winProb = this.calculateWinProbability(coins, minRequired);
    const fairMultiplier = 1 / winProb;
    return roundToDecimals(fairMultiplier * rtp, 2);
  }
}
