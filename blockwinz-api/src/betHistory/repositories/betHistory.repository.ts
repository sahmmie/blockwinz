import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { desc, eq, sql, and } from 'drizzle-orm';
import { BetHistoryDto } from '../dtos/betHistory.dto';
import { DbGameSchema } from 'src/shared/enums/dbSchema.enum';
import { PaginatedDataI } from 'src/shared/interfaces/pagination.interface';
import { DRIZZLE } from 'src/database/constants';
import type { DrizzleDb } from 'src/database/database.module';
import { betHistories } from 'src/database/schema/bet-histories';

@Injectable()
export class BetHistoryRepository {
  private readonly logger = new Logger(BetHistoryRepository.name);

  constructor(
    @Inject(DRIZZLE) private readonly db: DrizzleDb,
    @Inject(ConfigService) public config: ConfigService,
  ) {}

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

  async getUserBetHistory(
    userId: string,
    limit: number,
    page: number,
  ): Promise<PaginatedDataI<BetHistoryDto>> {
    if (!limit || !page) {
      throw new Error('Limit and page are required');
    }
    if (limit > 50) {
      throw new Error('Limit cannot exceed 50');
    }
    const offset = (page - 1) * limit;

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
    const pages =
      limit > 0
        ? Array.from({ length: Math.ceil(total / limit) }, (_, i) => i + 1)
        : [1];

    return {
      result: rows.map((r) => this.rowToDto(r)),
      total,
      page,
      pages,
    };
  }

  async getBetHistoryById(betId: string): Promise<BetHistoryDto> {
    const [row] = await this.db
      .select()
      .from(betHistories)
      .where(eq(betHistories.id, betId))
      .limit(1);

    if (!row) {
      throw new Error('Bet not found');
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
    if (!row) throw new Error('Failed to create bet history');
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
      throw new Error('Bet history not found');
    }
    const [row] = await db
      .update(betHistories)
      .set({
        totalWinAmount: String(totalWinAmount),
        updatedAt: new Date(),
      } as Record<string, unknown>)
      .where(eq(betHistories.id, existing.id))
      .returning();
    if (!row) throw new Error('Failed to update bet history');
    return this.rowToDto(row);
  }

  async getBetHistories(
    limit: number,
    page: number = 1,
    sortby: 'latest' | 'totalWinAmount' = 'latest',
  ): Promise<PaginatedDataI<BetHistoryDto>> {
    if (sortby !== 'latest' && sortby !== 'totalWinAmount') {
      throw new Error('Invalid sortby parameter');
    }
    if (!limit || !page) {
      throw new Error('Limit and page are required');
    }
    if (limit > 50) {
      throw new Error('Limit cannot exceed 50');
    }
    const offset = (page - 1) * limit;

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
    const pages =
      limit > 0
        ? Array.from({ length: Math.ceil(total / limit) }, (_, i) => i + 1)
        : [1];

    return {
      result: rows.map((r) => this.rowToDto(r)),
      total,
      page,
      pages,
    };
  }
}
