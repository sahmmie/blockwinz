import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { KenoBetRequestDto } from './dto/keno.dto';
import { kenoData } from './constants';
import { stringify } from 'flatted';
import { BetHistoryRepository } from 'src/betHistory/repositories/betHistory.repository';
import { FairLogicGenerateFloatsDto } from 'src/core/fairLogic/dtos/fairLogic.dto';
import { FairLogicRepository } from 'src/core/fairLogic/repositories/fairLogic.repository';
import { DbGameSchema } from '@blockwinz/shared';
import { TransactionRepository } from 'src/transaction/repositories/transaction.repository';
import { KenoGameStatus, KenoRisk } from './enums/keno.enums';
import { UserRequestI } from 'src/shared/interfaces/userRequest.type';
import { getUserId, getSeedId } from 'src/shared/helpers/user.helper';
import { currencyData } from 'src/shared/constants/currency.constant';
import {
  TransactionStatus,
  TransactionType,
} from '@blockwinz/shared';
import { WalletRepository } from 'src/wallet/repositories/wallet.repository';
import { stakeAuditFromRequest } from 'src/shared/utils/stake-audit.util';
import { CHAIN } from '@blockwinz/shared';
import { DRIZZLE } from 'src/database/constants';
import type { DrizzleDb } from 'src/database/database.module';
import { kenoGames } from 'src/database/schema/keno-games';
import { KenoRepository } from './repositories/keno.repositories';

@Injectable()
export class KenoService {
  private readonly logger = new Logger(KenoService.name);
  private kenoDataToGenerateFloats = { cursor: 0, count: 10 };

  constructor(
    @Inject(DRIZZLE) private readonly db: DrizzleDb,
    private readonly fairLogicRepository: FairLogicRepository,
    private readonly transactionRepository: TransactionRepository,
    private readonly betHistoryRepository: BetHistoryRepository,
    private readonly walletRepository: WalletRepository,
    private readonly kenoRepository: KenoRepository,
  ) {}

  async getKenoResult(player: UserRequestI, request: KenoBetRequestDto) {
    return await this.db
      .transaction(async (tx) => {
        const txDb = tx as unknown as DrizzleDb;

        if (request.betAmount > currencyData[request.currency].maxBet) {
          throw new BadRequestException(
            `Bet amount must be less than or equal to ${currencyData[request.currency].maxBet} for currency ${request.currency}`,
          );
        }
        this.logger.log(
          `GetKenoResult Start Player ID: ${player._id} Bet amount: ${request.betAmount}, Bet currency: ${request.currency}, selected tiles: ${request.selectedNumbers}, risk: ${request.risk}`,
        );

        const updatedPlayer = await this.fairLogicRepository.updatePlayerNonce(
          player,
          txDb,
        );

        const selectedNumbersCount = request.selectedNumbers.length;

        this.logger.log(
          `GetKenoResult Player ID: ${updatedPlayer.id} Nonce: ${updatedPlayer.nonce}`,
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
            this.kenoDataToGenerateFloats.count,
            this.kenoDataToGenerateFloats.cursor,
          );

        const kenoOutcome = this.generateKenoResultFloats(
          requestToGenerateFloats,
        );
        const playerHits = this.calculatePlayerHits(
          request.selectedNumbers,
          kenoOutcome,
        );
        const { multiplier, status } = this.getKenoResultStatus(
          playerHits,
          selectedNumbersCount,
          request.risk,
        );
        const totalWinAmount = Math.min(
          status === KenoGameStatus.WIN ? request.betAmount * multiplier : 0,
          currencyData[request.currency].maxProfit + request.betAmount,
        );

        const userId = getUserId(updatedPlayer);
        const seedId = getSeedId(updatedPlayer.activeSeed);

        const gameRow = await this.kenoRepository.insertKenoGame(txDb, {
          userId,
          seedId,
          betAmount: String(request.betAmount),
          totalWinAmount: String(totalWinAmount),
          currency: request.currency,
          multiplier: String(multiplier),
          nonce: updatedPlayer.nonce ?? 0,
          selectedNumbers: request.selectedNumbers,
          resultNumbers: kenoOutcome,
          risk: request.risk,
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
        } as typeof kenoGames.$inferInsert);

        const gameId = gameRow.id;

        if (request.betAmount > 0) {
          await this.transactionRepository.createTransaction(
            updatedPlayer,
            request.betAmount,
            gameId,
            DbGameSchema.KenoGame,
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
              DbGameSchema.KenoGame,
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
          DbGameSchema.KenoGame,
          request.betAmount,
          totalWinAmount,
          request.currency,
          multiplier,
          txDb,
          stakeAuditFromRequest(request),
        );

        return {
          status,
          multiplier,
          result: kenoOutcome,
          hits: playerHits,
          totalWinAmount,
        };
      })
      .catch((error) => {
        this.logger.error(`GetKenoResult Error: ${stringify(error)}`);
        throw error;
      });
  }

  private generateKenoResultFloats(
    request: FairLogicGenerateFloatsDto,
  ): number[] {
    const floats = this.fairLogicRepository.generateFloatsForGame(request);
    const SQUARES = Array.from({ length: 40 }, (_, i) => i + 1);
    const FINAL_KENO_BOARD: number[] = [];
    const TOTAL = 40;

    floats
      .map((float, i) => Math.floor(float * (TOTAL - i)))
      .forEach((hit) => {
        const square = SQUARES.splice(hit, 1)[0];
        FINAL_KENO_BOARD.push(square);
      });

    return FINAL_KENO_BOARD;
  }

  private calculatePlayerHits(
    selectedNumbers: number[],
    kenoOutcome: number[],
  ): number {
    return selectedNumbers.filter((n) => kenoOutcome.includes(n)).length;
  }

  private getKenoResultStatus(
    playerHits: number,
    selectedNumbersCount: number,
    risk: KenoRisk,
  ): { multiplier: number; status: KenoGameStatus } {
    const riskData = kenoData[risk];
    if (!riskData) {
      throw new InternalServerErrorException('Invalid risk level');
    }

    const countData = riskData[selectedNumbersCount];
    if (!countData) {
      throw new InternalServerErrorException('Invalid selected numbers count');
    }

    const multiplier = countData[playerHits];
    if (typeof multiplier === 'undefined') {
      throw new InternalServerErrorException('Invalid game data');
    }

    return {
      multiplier,
      status: multiplier ? KenoGameStatus.WIN : KenoGameStatus.LOSE,
    };
  }
}
