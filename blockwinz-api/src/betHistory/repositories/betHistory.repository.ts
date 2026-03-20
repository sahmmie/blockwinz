import { Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import { desc, eq, sql, and } from 'drizzle-orm';
import { BetHistoryDto } from '../dtos/betHistory.dto';
import { DbGameSchema } from 'src/shared/enums/dbSchema.enum';
import { DRIZZLE } from 'src/database/constants';
import type { DrizzleDb } from 'src/database/database.module';
import { betHistories } from 'src/database/schema/bet-histories';

@Injectable()
export class BetHistoryRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDb) {}

  private rowToDto(row: typeof betHistories.$inferSelect): BetHistoryDto {
    return {
      user: row.userId,
      gameId: row.gameId,
      gameType: row.gameType as DbGameSchema,
      betAmount: Number(row.betAmount),
      totalWinAmount:
        row.totalWinAmount != null ? Number(row.totalWinAmount) : undefined,
      createdAt: row.createdAt,
    };
  }

  async findUserBetHistoryPaginated(
    userId: string,
    limit: number,
    offset: number,
  ): Promise<{ result: BetHistoryDto[]; total: number }> {
    const rows = await this.db
      .select()
      .from(betHistories)
      .where(
        and(
          eq(betHistories.userId, userId),
          sql`${betHistories.betAmount} > 0`,
        ),
      )
      .orderBy(desc(betHistories.createdAt))
      .limit(limit)
      .offset(offset);

    const [{ count }] = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(betHistories)
      .where(
        and(
          eq(betHistories.userId, userId),
          sql`${betHistories.betAmount} > 0`,
        ),
      );

    const total = Number(count ?? 0);
    return {
      result: rows.map((r) => this.rowToDto(r)),
      total,
    };
  }

  async findBetHistoryById(betId: string): Promise<BetHistoryDto | null> {
    const [row] = await this.db
      .select()
      .from(betHistories)
      .where(eq(betHistories.id, betId))
      .limit(1);

    if (!row) {
      return null;
    }
    return this.rowToDto(row);
  }

  async createBetHistory(
    userId: string,
    gameId: string,
    gameType: DbGameSchema,
    betAmount: number,
    totalWinAmount: number,
    tx?: DrizzleDb,
  ): Promise<BetHistoryDto> {
    const db = tx ?? this.db;
    const [row] = await db
      .insert(betHistories)
      .values({
        userId,
        gameId,
        gameType,
        betAmount: String(betAmount),
        totalWinAmount: totalWinAmount != null ? String(totalWinAmount) : null,
      } as typeof betHistories.$inferInsert)
      .returning();
    if (!row) {
      throw new InternalServerErrorException('Failed to create bet history');
    }
    return this.rowToDto(row);
  }

  async updateBetHistory(
    gameId: string,
    totalWinAmount: number,
    tx?: DrizzleDb,
  ): Promise<BetHistoryDto> {
    const db = tx ?? this.db;
    const [existing] = await db
      .select()
      .from(betHistories)
      .where(eq(betHistories.gameId, gameId))
      .limit(1);
    if (!existing) {
      throw new InternalServerErrorException('Bet history not found');
    }
    const [row] = await db
      .update(betHistories)
      .set({
        totalWinAmount: String(totalWinAmount),
        updatedAt: new Date(),
      } as Record<string, unknown>)
      .where(eq(betHistories.id, existing.id))
      .returning();
    if (!row) {
      throw new InternalServerErrorException('Failed to update bet history');
    }
    return this.rowToDto(row);
  }

  async findAllBetHistoriesPaginated(
    limit: number,
    offset: number,
    sortby: 'latest' | 'totalWinAmount',
  ): Promise<{ result: BetHistoryDto[]; total: number }> {
    const rows =
      sortby === 'latest'
        ? await this.db
            .select()
            .from(betHistories)
            .where(sql`${betHistories.betAmount} > 0`)
            .orderBy(desc(betHistories.createdAt))
            .limit(limit)
            .offset(offset)
        : await this.db
            .select()
            .from(betHistories)
            .where(sql`${betHistories.betAmount} > 0`)
            .orderBy(
              desc(betHistories.totalWinAmount),
              desc(betHistories.createdAt),
            )
            .limit(limit)
            .offset(offset);

    const [{ count }] = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(betHistories)
      .where(sql`${betHistories.betAmount} > 0`);

    const total = Number(count ?? 0);
    return {
      result: rows.map((r) => this.rowToDto(r)),
      total,
    };
  }
}
