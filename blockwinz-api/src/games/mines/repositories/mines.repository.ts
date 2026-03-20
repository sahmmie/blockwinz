import {
  Inject,
  Injectable,
  Logger,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { stringify } from 'flatted';
import {
  MinesResponseDto,
  RevealMineDto,
  StartMineDto,
} from '../dto/mines.dto';
import { MinesGameStatus } from '../enums/mines.enums';
import { UserRequestI } from 'src/shared/interfaces/userRequest.type';
import { getUserId, getSeedId } from 'src/shared/helpers/user.helper';
import { FairLogicGenerateFloatsDto } from 'src/core/fairLogic/dtos/fairLogic.dto';
import { FairLogicRepository } from 'src/core/fairLogic/repositories/fairLogic.repository';
import { SeedDto } from 'src/core/seeds /dtos/seeds.dto';
import {
  TransactionType,
  TransactionStatus,
} from 'src/shared/enums/transaction.enums';
import { TransactionRepository } from 'src/transaction/repositories/transaction.repository';
import { currencyData } from 'src/shared/constants/currency.constant';
import { roundToDecimals } from 'src/shared/helpers/utils-functions.helper';
import { BetHistoryRepository } from 'src/betHistory/repositories/betHistory.repository';
import { WalletRepository } from 'src/wallet/repositories/wallet.repository';
import { CHAIN, Currency } from 'src/shared/enums/currencies.enum';
import { DbGameSchema } from 'src/shared/enums/dbSchema.enum';
import { AuthenticationRepository } from 'src/authentication/repositories/authentication.repository';
import { DRIZZLE } from 'src/database/constants';
import type { DrizzleDb } from 'src/database/database.module';
import { minesGames } from 'src/database/schema/mines-games';
import { and, eq, lt } from 'drizzle-orm';
import type { MinesGameSelect } from 'src/database/schema/mines-games';

const HOUSE_EDGE = 0.01;
const MINES_GAME_TILES_COUNT = 25;

@Injectable()
export class MinesRepository {
  private readonly logger = new Logger(MinesRepository.name);

  constructor(
    @Inject(DRIZZLE) private readonly db: DrizzleDb,
    private readonly fairLogicRepository: FairLogicRepository,
    private readonly transactionRepository: TransactionRepository,
    private readonly authenticationRepository: AuthenticationRepository,
    private readonly betHistoryRepository: BetHistoryRepository,
    private readonly walletRepository: WalletRepository,
  ) {}

  async start(
    player: UserRequestI,
    request: StartMineDto,
  ): Promise<MinesResponseDto> {
    return await this.db
      .transaction(async (tx) => {
        const txDb = tx as unknown as DrizzleDb;

        this.logger.log(
          `MINES START Start Player ID: ${player._id} Bet amount: ${request.betAmount} Bet currency: ${request.currency} Mines count: ${request.minesCount}`,
        );

        const activeGame = await this.getActiveGame(String(player._id), txDb);
        if (activeGame) {
          this.logger.log(
            `MINES START Player ID: ${player._id} Active game found with Game ID: ${activeGame.id}`,
          );
          return activeGame;
        }

        const firstRevealWinMultiplier = this.calculateWinMultiplier(
          1,
          request.minesCount,
        );
        this.validateProfitLimit(
          request.betAmount,
          firstRevealWinMultiplier,
          request.currency,
        );

        const updatedPlayer = await this.fairLogicRepository.updatePlayerNonce(
          player,
          txDb,
        );
        this.logger.log(
          `MINES START Player ID: ${updatedPlayer._id} Nonce: ${updatedPlayer.nonce}`,
        );

        const floats = this.fairLogicRepository.generateFloatsForGame({
          cursor: 0,
          nonce: updatedPlayer.nonce ?? 0,
          count: request.minesCount,
          clientSeed: (updatedPlayer.activeSeed as SeedDto).clientSeed,
          serverSeed: (updatedPlayer.activeSeed as SeedDto).serverSeed,
        } satisfies FairLogicGenerateFloatsDto);

        const minesResult = this.generateMinesResult(floats);
        const winMultiplier = this.calculateWinMultiplier(
          0,
          request.minesCount,
        );

        const userId = getUserId(updatedPlayer);
        const seedId = getSeedId(updatedPlayer.activeSeed);

        const [gameRow] = await tx
          .insert(minesGames)
          .values({
            userId,
            seedId,
            betAmount: String(request.betAmount),
            totalWinAmount: null,
            currency: request.currency,
            multiplier: String(winMultiplier),
            nonce: updatedPlayer.nonce ?? 0,
            betResultStatus: MinesGameStatus.OPEN,
            minesCount: request.minesCount,
            selected: [],
            minesResult,
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
          } as typeof minesGames.$inferInsert)
          .returning();

        if (!gameRow) throw new Error('Failed to create mines game');

        const gameId = gameRow.id;

        if (request.betAmount > 0) {
          await this.transactionRepository.createTransaction(
            updatedPlayer,
            request.betAmount,
            gameId,
            DbGameSchema.MinesGame,
            TransactionType.DEBIT,
            TransactionStatus.PENDING,
            new Date(),
            CHAIN.SOLANA,
            request.currency,
            null,
            undefined,
            undefined,
            txDb,
          );
          await this.walletRepository.lockBetFunds(
            updatedPlayer,
            request.betAmount,
            request.currency,
            txDb,
          );
        }

        await this.betHistoryRepository.createBetHistory(
          userId,
          gameId,
          DbGameSchema.MinesGame,
          request.betAmount,
          null,
          txDb,
        );

        this.logger.log(
          `MINES START Game ID: ${gameId} Player ID ${updatedPlayer._id} STARTED`,
        );

        return this.buildGameResponseFromRow(gameRow, []);
      })
      .catch((error) => {
        this.logger.error(`MINES START Error: ${stringify(error)}`);
        throw error;
      });
  }

  async reveal(
    player: UserRequestI,
    data: RevealMineDto,
  ): Promise<MinesResponseDto> {
    return await this.db
      .transaction(async (tx) => {
        const txDb = tx as unknown as DrizzleDb;

        const [gameRow] = await tx
          .select()
          .from(minesGames)
          .where(
            and(
              eq(minesGames.userId, String(player._id)),
              eq(minesGames.betResultStatus, MinesGameStatus.OPEN),
            ),
          )
          .limit(1);

        if (!gameRow) {
          throw new NotFoundException('Game not found');
        }

        this.logger.log(
          `MINES REVEAL Start Player ID: ${player._id} Game ID: ${gameRow.id} Position: ${data.position}`,
        );

        this.validateGameReveal(this.rowToGameLike(gameRow), data.position);

        const hitMine = gameRow.minesResult.includes(data.position);

        if (hitMine) {
          const newSelected = [...gameRow.selected, data.position];
          await tx
            .update(minesGames)
            .set({
              multiplier: '0',
              betResultStatus: MinesGameStatus.FINISHED,
              totalWinAmount: '0',
              selected: newSelected,
              updatedAt: new Date(),
            } as Partial<MinesGameSelect>)
            .where(eq(minesGames.id, gameRow.id));

          if (Number(gameRow.betAmount) > 0) {
            await this.transactionRepository.createTransaction(
              player,
              0,
              gameRow.id,
              DbGameSchema.MinesGame,
              TransactionType.CREDIT,
              TransactionStatus.SETTLED,
              new Date(),
              CHAIN.SOLANA,
              gameRow.currency as Currency,
              null,
              undefined,
              undefined,
              txDb,
            );
            await this.walletRepository.debitPlayer(
              player,
              Number(gameRow.betAmount),
              gameRow.currency as Currency,
              txDb,
            );
            await this.walletRepository.releaseBetFunds(
              player,
              Number(gameRow.betAmount),
              gameRow.currency as Currency,
              txDb,
            );
          }

          await this.betHistoryRepository.updateBetHistory(gameRow.id, 0, txDb);

          const updatedRow: MinesGameSelect = {
            ...gameRow,
            multiplier: '0',
            betResultStatus: MinesGameStatus.FINISHED,
            totalWinAmount: '0',
            selected: newSelected,
          };
          return this.buildGameResponseFromRow(updatedRow, gameRow.minesResult);
        }

        const openedSafe = gameRow.selected.length + 1;
        const newMultiplier = this.calculateWinMultiplier(
          openedSafe,
          gameRow.minesCount,
        );
        const newSelected = [...gameRow.selected, data.position];

        this.validateProfitLimit(
          Number(gameRow.betAmount),
          newMultiplier,
          gameRow.currency,
        );

        await tx
          .update(minesGames)
          .set({
            multiplier: String(newMultiplier),
            selected: newSelected,
            updatedAt: new Date(),
          } as Partial<MinesGameSelect>)
          .where(eq(minesGames.id, gameRow.id));

        const allSafeRevealed =
          newSelected.length >= MINES_GAME_TILES_COUNT - gameRow.minesCount;

        if (allSafeRevealed) {
          const updatedRow: MinesGameSelect = {
            ...gameRow,
            multiplier: String(newMultiplier),
            selected: newSelected,
          };
          return await this.performCashout(player, updatedRow, txDb);
        }

        const updatedRow: MinesGameSelect = {
          ...gameRow,
          multiplier: String(newMultiplier),
          selected: newSelected,
        };
        return this.buildGameResponseFromRow(updatedRow, []);
      })
      .catch((error) => {
        this.logger.error(`MINES REVEAL Error: ${stringify(error)}`);
        throw error;
      });
  }

  async cashout(player: UserRequestI): Promise<MinesResponseDto> {
    return await this.db
      .transaction(async (tx) => {
        const txDb = tx as unknown as DrizzleDb;

        const [gameRow] = await tx
          .select()
          .from(minesGames)
          .where(
            and(
              eq(minesGames.userId, String(player._id)),
              eq(minesGames.betResultStatus, MinesGameStatus.OPEN),
            ),
          )
          .limit(1);

        if (!gameRow) {
          throw new NotFoundException('Game not found');
        }

        this.logger.log(
          `MINES CASHOUT Start Player ID: ${player._id} Game ID: ${gameRow.id}`,
        );

        const response = await this.performCashout(player, gameRow, txDb);

        this.logger.log(
          `MINES CASHOUT Player ID: ${player._id} Game ID: ${gameRow.id} COMPLETED`,
        );

        return response;
      })
      .catch((error) => {
        this.logger.error(`MINES CASHOUT Error: ${stringify(error)}`);
        throw error;
      });
  }

  private async performCashout(
    player: UserRequestI,
    gameRow: MinesGameSelect,
    tx: DrizzleDb,
  ): Promise<MinesResponseDto> {
    const gameLike = this.rowToGameLike(gameRow);
    this.validateProfitLimit(
      Number(gameRow.betAmount),
      Number(gameRow.multiplier),
      gameRow.currency,
    );
    this.validateGameCashout(gameLike);

    const totalWinAmount = this.calculateProfit(
      Number(gameRow.betAmount),
      Number(gameRow.multiplier),
    );

    if (Number(gameRow.betAmount) > 0) {
      await this.transactionRepository.createTransaction(
        player,
        totalWinAmount,
        gameRow.id,
        DbGameSchema.MinesGame,
        TransactionType.CREDIT,
        TransactionStatus.SETTLED,
        new Date(),
        CHAIN.SOLANA,
        gameRow.currency as Currency,
        null,
        undefined,
        undefined,
        tx,
      );
      await this.walletRepository.releaseBetFunds(
        player,
        Number(gameRow.betAmount),
        gameRow.currency as Currency,
        tx,
      );
      await this.walletRepository.debitPlayer(
        player,
        Number(gameRow.betAmount),
        gameRow.currency as Currency,
        tx,
      );
      await this.walletRepository.creditPlayer(
        player,
        totalWinAmount,
        gameRow.currency as Currency,
        tx,
      );
    }

    await tx
      .update(minesGames)
      .set({
        betResultStatus: MinesGameStatus.CASHOUT,
        totalWinAmount: String(totalWinAmount),
        updatedAt: new Date(),
      } as Partial<MinesGameSelect>)
      .where(eq(minesGames.id, gameRow.id));

    await this.betHistoryRepository.updateBetHistory(
      gameRow.id,
      totalWinAmount,
      tx,
    );

    return this.buildGameResponseFromRow(
      {
        ...gameRow,
        betResultStatus: MinesGameStatus.CASHOUT,
        totalWinAmount: String(totalWinAmount),
      },
      gameRow.minesResult,
    );
  }

  async getActiveGame(
    playerId: string,
    tx?: DrizzleDb,
  ): Promise<MinesResponseDto | null> {
    const db = tx ?? this.db;
    const [row] = await db
      .select()
      .from(minesGames)
      .where(
        and(
          eq(minesGames.userId, playerId),
          eq(minesGames.betResultStatus, MinesGameStatus.OPEN),
        ),
      )
      .limit(1);

    if (!row) return null;
    return this.buildGameResponseFromRow(row, []);
  }

  async closeInactiveGames(): Promise<void> {
    this.logger.warn('Closing inactive mines games');

    const fiveMinuteAgo = new Date(Date.now() - 5 * 60 * 1000);
    const games = await this.db
      .select()
      .from(minesGames)
      .where(
        and(
          eq(minesGames.betResultStatus, MinesGameStatus.OPEN),
          lt(minesGames.createdAt, fiveMinuteAgo),
        ),
      );

    this.logger.warn(`Closing ${games.length} inactive mines games`);

    for (const game of games) {
      await this.db
        .transaction(async (tx) => {
          const txDb = tx as unknown as DrizzleDb;

          if (Number(game.betAmount) > 0) {
            const player =
              (await this.authenticationRepository.findUserWithProfile(
                game.userId,
              )) as UserRequestI;

            await this.transactionRepository.createTransaction(
              player,
              Number(game.betAmount),
              game.id,
              DbGameSchema.MinesGame,
              TransactionType.CREDIT_REFUND,
              TransactionStatus.SETTLED,
              new Date(),
              CHAIN.SOLANA,
              game.currency as Currency,
              null,
              undefined,
              undefined,
              txDb,
            );
            await this.walletRepository.releaseBetFunds(
              player,
              Number(game.betAmount),
              game.currency as Currency,
              txDb,
            );
          }

          await tx
            .update(minesGames)
            .set({
              betResultStatus: MinesGameStatus.FINISHED,
              updatedAt: new Date(),
            } as Partial<MinesGameSelect>)
            .where(eq(minesGames.id, game.id));
        })
        .catch((error) => {
          this.logger.error(
            `Close Inactive Mines Error for game ${game.id}: ${stringify(error)}`,
          );
        });
    }
  }

  async closeMineGame(gameId: string): Promise<void> {
    return await this.db
      .transaction(async (tx) => {
        const txDb = tx as unknown as DrizzleDb;

        const [gameRow] = await tx
          .select()
          .from(minesGames)
          .where(
            and(
              eq(minesGames.id, gameId),
              eq(minesGames.betResultStatus, MinesGameStatus.OPEN),
            ),
          )
          .limit(1);

        if (!gameRow) {
          throw new NotFoundException('Game not found');
        }

        if (Number(gameRow.betAmount) > 0) {
          const player =
            (await this.authenticationRepository.findUserWithProfile(
              gameRow.userId,
            )) as UserRequestI;

          await this.transactionRepository.createTransaction(
            player,
            Number(gameRow.betAmount),
            gameRow.id,
            DbGameSchema.MinesGame,
            TransactionType.CREDIT_REFUND,
            TransactionStatus.SETTLED,
            new Date(),
            CHAIN.SOLANA,
            gameRow.currency as Currency,
            null,
            undefined,
            undefined,
            txDb,
          );
          await this.walletRepository.releaseBetFunds(
            player,
            Number(gameRow.betAmount),
            gameRow.currency as Currency,
            txDb,
          );
        }

        await tx
          .update(minesGames)
          .set({
            betResultStatus: MinesGameStatus.FINISHED,
            updatedAt: new Date(),
          } as Partial<MinesGameSelect>)
          .where(eq(minesGames.id, gameRow.id));
      })
      .catch((error) => {
        this.logger.error(`Close Mines Game Error: ${stringify(error)}`);
        throw error;
      });
  }

  private rowToGameLike(row: MinesGameSelect): {
    id: string;
    user: string;
    betAmount: number;
    currency: string;
    multiplier: number;
    betResultStatus: string;
    selected: number[];
    minesCount: number;
  } {
    return {
      id: row.id,
      user: row.userId,
      betAmount: Number(row.betAmount),
      currency: row.currency,
      multiplier: Number(row.multiplier),
      betResultStatus: row.betResultStatus,
      selected: row.selected,
      minesCount: row.minesCount,
    };
  }

  private buildGameResponseFromRow(
    row: MinesGameSelect,
    minesResultOverride: number[],
  ): MinesResponseDto {
    const multiplier = Number(row.multiplier);
    const totalWinAmount =
      row.totalWinAmount != null ? Number(row.totalWinAmount) : null;
    return {
      user: row.userId,
      id: row.id,
      currency: row.currency as Currency,
      selected: row.selected,
      betAmount: Number(row.betAmount),
      createdAt: row.createdAt,
      betResultStatus: row.betResultStatus as MinesGameStatus,
      minesCount: row.minesCount,
      minesResult: minesResultOverride,
      multiplier,
      totalWinAmount: totalWinAmount ?? 0,
      ...(row.betResultStatus === MinesGameStatus.OPEN && {
        nextWinMultiplier: this.calculateWinMultiplier(
          row.selected.length + 1,
          row.minesCount,
        ),
      }),
    };
  }

  private validateGameCashout(game: {
    betResultStatus: string;
    selected: number[];
  }): void {
    if (game.betResultStatus === MinesGameStatus.CASHOUT) {
      throw new ForbiddenException('Game already cashed out');
    }
    if (game.betResultStatus === MinesGameStatus.FINISHED) {
      throw new ForbiddenException('Game is already finished');
    }
    if (!game.selected.length) {
      throw new ForbiddenException('You must reveal at least one mine');
    }
  }

  private calculateProfit = (betAmount: number, multiplier: number): number => {
    return roundToDecimals(betAmount * multiplier);
  };

  private validateProfitLimit(
    betAmount: number,
    winMultiplier: number,
    currency: string,
  ): void {
    const totalWinAmount = betAmount * winMultiplier;
    const theoreticalProfit = totalWinAmount - betAmount;

    if (theoreticalProfit > currencyData[currency].maxProfit) {
      throw new BadRequestException(
        `Profit must be less than ${currencyData[currency].maxProfit} for currency ${currency}`,
      );
    }
  }

  private calculateWinMultiplier(
    openedMines: number,
    minesCount: number,
  ): number {
    const n = MINES_GAME_TILES_COUNT;
    const x = n - minesCount;
    const d = openedMines;

    if (d === 0) return 0;

    function factorial(number: number): number {
      let value = 1;
      for (let i = 2; i <= number; i++) {
        value *= i;
      }
      return value;
    }

    function combination(a: number, b: number): number {
      if (b > a) return 0;
      if (b === 0 || b === a) return 1;
      return factorial(a) / (factorial(b) * factorial(a - b));
    }

    const first = combination(n, d);
    const second = combination(x, d);
    const result = (1 - HOUSE_EDGE) * (first / second);
    return Math.round(result * 100) / 100;
  }

  private generateMinesResult(floats: number[]): number[] {
    const availablePositions = Array.from(
      { length: MINES_GAME_TILES_COUNT },
      (_, i) => i,
    );

    return floats.map((float, i) => {
      const randomIndex = Math.floor(float * (MINES_GAME_TILES_COUNT - i));
      return availablePositions.splice(randomIndex, 1)[0];
    });
  }

  private validateGameReveal(
    game: { betResultStatus: string; selected: number[] },
    position: number,
  ): void {
    if (game.betResultStatus !== MinesGameStatus.OPEN) {
      throw new ForbiddenException('Game is not open');
    }
    if (game.selected.includes(position)) {
      throw new ForbiddenException('Position already selected');
    }
  }
}
