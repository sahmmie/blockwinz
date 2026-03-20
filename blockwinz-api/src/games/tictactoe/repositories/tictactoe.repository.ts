import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { DRIZZLE } from 'src/database/constants';
import type { DrizzleDb } from 'src/database/database.module';
import { tictactoeGames } from 'src/database/schema/tictactoe-games';
import { and, eq } from 'drizzle-orm';
import type { TicTacToeGameSelect } from 'src/database/schema/tictactoe-games';
import { TicTacToeStatus } from '../enums/tictactoe.enums';
import { Currency } from '@blockwinz/shared';
import { TicTacToeDto } from '../dtos/tictactoe.dto';
import { TicTacToeMultiplier } from '../enums/tictactoe.enums';

@Injectable()
export class TicTacToeRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDb) {}

  async findActiveGameRow(
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

  async insertGame(
    tx: DrizzleDb,
    values: typeof tictactoeGames.$inferInsert,
  ): Promise<TicTacToeGameSelect> {
    const [row] = await tx.insert(tictactoeGames).values(values).returning();
    if (!row) {
      throw new InternalServerErrorException('Failed to create tictactoe game');
    }
    return row;
  }

  async updateGame(
    tx: DrizzleDb,
    gameId: string,
    data: {
      board: Array<Array<'X' | 'O' | ''>>;
      betResultStatus: TicTacToeStatus;
      currentTurn: string | null;
      totalWinAmount: number;
    },
  ): Promise<void> {
    await tx
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

  mapToDto(row: TicTacToeGameSelect): TicTacToeDto {
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
}
