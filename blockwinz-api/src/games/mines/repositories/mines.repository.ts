import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { DRIZZLE } from 'src/database/constants';
import type { DrizzleDb } from 'src/database/database.module';
import { minesGames } from 'src/database/schema/mines-games';
import { and, eq, lt } from 'drizzle-orm';
import type { MinesGameSelect } from 'src/database/schema/mines-games';
import { MinesGameStatus } from '../enums/mines.enums';

@Injectable()
export class MinesRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDb) {}

  async insertGame(
    tx: DrizzleDb,
    values: typeof minesGames.$inferInsert,
  ): Promise<MinesGameSelect> {
    const [row] = await tx.insert(minesGames).values(values).returning();
    if (!row) {
      throw new InternalServerErrorException('Failed to create mines game');
    }
    return row;
  }

  async findOpenGameByUserId(
    db: DrizzleDb,
    userId: string,
  ): Promise<MinesGameSelect | undefined> {
    const [row] = await db
      .select()
      .from(minesGames)
      .where(
        and(
          eq(minesGames.userId, userId),
          eq(minesGames.betResultStatus, MinesGameStatus.OPEN),
        ),
      )
      .limit(1);
    return row;
  }

  async updateGameById(
    tx: DrizzleDb,
    gameId: string,
    patch: Partial<MinesGameSelect>,
  ): Promise<void> {
    await tx
      .update(minesGames)
      .set({
        ...patch,
        updatedAt: new Date(),
      } as Partial<MinesGameSelect>)
      .where(eq(minesGames.id, gameId));
  }

  async findStaleOpenGames(before: Date): Promise<MinesGameSelect[]> {
    return this.db
      .select()
      .from(minesGames)
      .where(
        and(
          eq(minesGames.betResultStatus, MinesGameStatus.OPEN),
          lt(minesGames.createdAt, before),
        ),
      );
  }

  async findOpenGameById(
    tx: DrizzleDb,
    gameId: string,
  ): Promise<MinesGameSelect | undefined> {
    const [row] = await tx
      .select()
      .from(minesGames)
      .where(
        and(
          eq(minesGames.id, gameId),
          eq(minesGames.betResultStatus, MinesGameStatus.OPEN),
        ),
      )
      .limit(1);
    return row;
  }
}
