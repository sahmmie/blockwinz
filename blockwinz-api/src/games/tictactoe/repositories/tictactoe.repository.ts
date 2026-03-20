import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserRequestI } from 'src/shared/interfaces/userRequest.type';
import { getUserId, getSeedId } from 'src/shared/helpers/user.helper';
import {
  TicTacToeDto,
  TicTacToeMoveDto,
  TicTacToeMoveResponseDto,
  TicTacToeStartReqDto,
} from '../dtos/tictactoe.dto';
import { TicTacToeMultiplier, TicTacToeStatus } from '../enums/tictactoe.enums';
import {
  cloneBoard,
  generateEmptyBoard,
  getGameStatus,
  makeAIMove,
} from '../logic/game';
import { TransactionRepository } from 'src/transaction/repositories/transaction.repository';
import {
  TransactionStatus,
  TransactionType,
} from 'src/shared/enums/transaction.enums';
import { DbGameSchema } from 'src/shared/enums/dbSchema.enum';
import { BetHistoryRepository } from 'src/betHistory/repositories/betHistory.repository';
import { roundToDecimals } from 'src/shared/helpers/utils-functions.helper';
import { WalletRepository } from 'src/wallet/repositories/wallet.repository';
import { CHAIN, Currency } from 'src/shared/enums/currencies.enum';
import { DRIZZLE } from 'src/database/constants';
import type { DrizzleDb } from 'src/database/database.module';
import { tictactoeGames } from 'src/database/schema/tictactoe-games';
import { and, eq } from 'drizzle-orm';
import type { TicTacToeGameSelect } from 'src/database/schema/tictactoe-games';
import { FairLogicRepository } from 'src/core/fairLogic/repositories/fairLogic.repository';

@Injectable()
export class TicTacToeRepository {
  constructor(
    @Inject(DRIZZLE) private readonly db: DrizzleDb,
    private readonly transactionRepository: TransactionRepository,
    private readonly betHistoryRepository: BetHistoryRepository,
    private readonly walletRepository: WalletRepository,
    private readonly fairLogicRepository: FairLogicRepository,
  ) {}

  public async startNewGame(
    requestBody: TicTacToeStartReqDto,
    player: UserRequestI,
  ): Promise<TicTacToeDto> {
    return await this.db.transaction(async (tx) => {
      const txDb = tx as unknown as DrizzleDb;

      const activeRow = await this.getActiveGameRow(String(player._id), txDb);
      if (activeRow) {
        return this.rowToDto(activeRow);
      }

      await this.walletRepository.checkPlayerBalance(
        player,
        requestBody.betAmount,
        requestBody.currency,
        txDb,
      );

      const updatedPlayer = await this.fairLogicRepository.updatePlayerNonce(
        player,
        txDb,
      );

      const risk = this.getEnumKeyByValue(requestBody.multiplier).toLowerCase();
      const userId = getUserId(updatedPlayer);
      const seedId = getSeedId(updatedPlayer.activeSeed);

      const [gameRow] = await tx
        .insert(tictactoeGames)
        .values({
          userId,
          seedId,
          betAmount: String(requestBody.betAmount),
          totalWinAmount: null,
          currency: requestBody.currency,
          multiplier: String(requestBody.multiplier),
          nonce: updatedPlayer.nonce ?? 0,
          board: generateEmptyBoard() as Array<Array<'X' | 'O' | ''>>,
          betResultStatus: TicTacToeStatus.IN_PROGRESS,
          userIs: 'O',
          aiIs: 'X',
          currentTurn: 'O',
          risk,
          stopOnProfit: null,
          stopOnLoss: null,
          increaseBy: null,
          decreaseBy: null,
          isManualMode: false,
          isTurboMode: requestBody.isTurboMode ?? false,
        } as typeof tictactoeGames.$inferInsert)
        .returning();

      if (!gameRow) throw new Error('Failed to create tictactoe game');

      const gameId = gameRow.id;

      if (requestBody.betAmount > 0) {
        await this.transactionRepository.createTransaction(
          updatedPlayer,
          requestBody.betAmount,
          gameId,
          DbGameSchema.TicTacToeGame,
          TransactionType.DEBIT,
          TransactionStatus.PENDING,
          new Date(),
          CHAIN.SOLANA,
          requestBody.currency,
          null,
          undefined,
          undefined,
          txDb,
        );
        await this.walletRepository.lockBetFunds(
          updatedPlayer,
          requestBody.betAmount,
          requestBody.currency,
          txDb,
        );
      }

      await this.betHistoryRepository.createBetHistory(
        userId,
        gameId,
        DbGameSchema.TicTacToeGame,
        requestBody.betAmount,
        null,
        txDb,
      );

      return this.rowToDto(gameRow);
    });
  }

  public async getActiveGame(user: UserRequestI): Promise<TicTacToeDto | null> {
    const row = await this.getActiveGameRow(String(user._id));
    return row ? this.rowToDto(row) : null;
  }

  private async getActiveGameRow(
    userId: string,
    tx?: DrizzleDb,
  ): Promise<TicTacToeGameSelect | null> {
    const db = tx ?? this.db;
    const [row] = await db
      .select()
      .from(tictactoeGames)
      .where(
        and(
          eq(tictactoeGames.userId, userId),
          eq(tictactoeGames.betResultStatus, TicTacToeStatus.IN_PROGRESS),
        ),
      )
      .limit(1);
    return row ?? null;
  }

  public async makeMove(
    requestBody: TicTacToeMoveDto,
    player: UserRequestI,
  ): Promise<TicTacToeMoveResponseDto> {
    return await this.db.transaction(async (tx) => {
      const txDb = tx as unknown as DrizzleDb;

      const gameRow = await this.getActiveGameRow(String(player._id), txDb);
      if (!gameRow) {
        throw new NotFoundException('No Active Game Found');
      }

      const { move } = requestBody;
      const board = cloneBoard(gameRow.board as string[][]);

      if (gameRow.betResultStatus !== TicTacToeStatus.IN_PROGRESS) {
        throw new BadRequestException('Game is not in progress');
      }

      if (gameRow.currentTurn !== gameRow.userIs) {
        throw new BadRequestException('It is not your turn');
      }

      if (
        board[move.row] === undefined ||
        board[move.row][move.column] === undefined
      ) {
        throw new BadRequestException('Invalid move: Move is not valid');
      }

      if (board[move.row][move.column] !== '') {
        throw new BadRequestException(
          'Invalid move: cell is already occupied.',
        );
      }
      board[move.row][move.column] = gameRow.userIs as 'X' | 'O';

      const gameStatus = getGameStatus(
        board,
        gameRow.aiIs,
        gameRow.userIs,
      ) as TicTacToeStatus;

      if (gameStatus !== TicTacToeStatus.IN_PROGRESS) {
        const totalWinAmount = this.calculateProfit(
          gameStatus,
          Number(gameRow.betAmount),
          gameRow.multiplier as TicTacToeMultiplier,
        );
        await this.updateGame(tx, gameRow.id, {
          board: board as Array<Array<'X' | 'O' | ''>>,
          betResultStatus: gameStatus,
          currentTurn: null,
          totalWinAmount:
            gameStatus === TicTacToeStatus.TIE ? 0 : totalWinAmount,
        });

        await this.betHistoryRepository.updateBetHistory(
          gameRow.id,
          totalWinAmount,
          txDb,
        );

        if (Number(gameRow.betAmount) > 0) {
          const debitTransaction =
            await this.transactionRepository.getTransactionsByGameAndType(
              gameRow.id,
              TransactionType.DEBIT,
              txDb,
            );
          if (debitTransaction) {
            debitTransaction.status = TransactionStatus.SETTLED;
            await this.transactionRepository.updateTransaction(
              debitTransaction,
              txDb,
            );
          }

          await this.walletRepository.releaseBetFunds(
            player,
            Number(gameRow.betAmount),
            gameRow.currency as Currency,
            txDb,
          );
          await this.walletRepository.debitPlayer(
            player,
            Number(gameRow.betAmount),
            gameRow.currency as Currency,
            txDb,
          );

          if (
            gameStatus === TicTacToeStatus.WIN ||
            gameStatus === TicTacToeStatus.TIE
          ) {
            await this.transactionRepository.createTransaction(
              player,
              totalWinAmount,
              gameRow.id,
              DbGameSchema.TicTacToeGame,
              gameStatus === TicTacToeStatus.TIE
                ? TransactionType.CREDIT_REFUND
                : TransactionType.CREDIT,
              TransactionStatus.SETTLED,
              new Date(),
              CHAIN.SOLANA,
              gameRow.currency as Currency,
              null,
              undefined,
              undefined,
              txDb,
            );
            await this.walletRepository.creditPlayer(
              player,
              totalWinAmount,
              gameRow.currency as Currency,
              txDb,
            );
          }
        }

        return {
          board,
          move: null,
          betResultStatus: gameStatus,
          currentTurn: gameRow.userIs,
        };
      }

      const aiResult = makeAIMove(
        board,
        gameRow.aiIs,
        gameRow.userIs,
        gameRow.multiplier as TicTacToeMultiplier,
      );

      await this.updateGame(tx, gameRow.id, {
        board: aiResult.board as Array<Array<'X' | 'O' | ''>>,
        betResultStatus: aiResult.betResultStatus,
        currentTurn: gameRow.userIs,
        totalWinAmount: 0,
      });

      return aiResult;
    });
  }

  private async updateGame(
    tx: unknown,
    gameId: string,
    data: {
      board: Array<Array<'X' | 'O' | ''>>;
      betResultStatus: TicTacToeStatus;
      currentTurn: string | null;
      totalWinAmount: number;
    },
  ): Promise<void> {
    const db = tx as DrizzleDb;
    await db
      .update(tictactoeGames)
      .set({
        board: data.board,
        betResultStatus: data.betResultStatus,
        currentTurn: data.currentTurn,
        totalWinAmount: String(data.totalWinAmount),
        updatedAt: new Date(),
      } as Partial<TicTacToeGameSelect>)
      .where(eq(tictactoeGames.id, gameId));
  }

  private rowToDto(row: TicTacToeGameSelect): TicTacToeDto {
    return {
      id: row.id,
      user: row.userId,
      betAmount: Number(row.betAmount),
      currency: row.currency as Currency,
      nonce: row.nonce,
      totalWinAmount:
        row.totalWinAmount != null ? Number(row.totalWinAmount) : undefined,
      multiplier: row.multiplier as TicTacToeMultiplier,
      board: (row.board ?? []) as string[][],
      betResultStatus: row.betResultStatus as TicTacToeStatus,
      currentTurn: row.currentTurn as 'X' | 'O' | null,
      userIs: row.userIs,
      aiIs: row.aiIs,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    } as unknown as TicTacToeDto;
  }

  private calculateProfit = (
    resultStatus: TicTacToeStatus,
    betAmount: number,
    multiplier: TicTacToeMultiplier,
  ): number => {
    return roundToDecimals(
      resultStatus === TicTacToeStatus.WIN
        ? betAmount * Number(multiplier)
        : resultStatus === TicTacToeStatus.TIE
          ? betAmount * 0.1
          : 0,
    );
  };

  private getEnumKeyByValue = (value: string): string => {
    const entry = Object.entries(TicTacToeMultiplier).find(
      ([, val]) => val === value,
    );
    return entry?.[0] ?? 'LOW';
  };
}
