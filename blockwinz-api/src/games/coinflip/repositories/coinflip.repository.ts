import { Injectable, InternalServerErrorException } from '@nestjs/common';
import type { DrizzleDb } from 'src/database/database.module';
import { coinflipGames } from 'src/database/schema/coinflip-games';

/**
 * Persists coin flip rounds to PostgreSQL via Drizzle.
 */
@Injectable()
export class CoinFlipRepository {
  /**
   * Inserts one settled coin flip game row inside the caller's transaction.
   *
   * @param tx - Drizzle transaction client
   * @param values - Row matching `coinflip_games` columns
   * @returns The inserted row including generated `id`
   * @throws InternalServerErrorException when the insert returns no row
   */
  async insertCoinFlipGame(
    tx: DrizzleDb,
    values: typeof coinflipGames.$inferInsert,
  ): Promise<typeof coinflipGames.$inferSelect> {
    const [row] = await tx.insert(coinflipGames).values(values).returning();
    if (!row) {
      throw new InternalServerErrorException('Failed to create coin flip game');
    }
    return row;
  }
}
