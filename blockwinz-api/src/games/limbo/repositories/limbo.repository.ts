import { Injectable, InternalServerErrorException } from '@nestjs/common';
import type { DrizzleDb } from 'src/database/database.module';
import { limboGames } from 'src/database/schema/limbo-games';

@Injectable()
export class LimboRepository {
  async insertLimboGame(
    tx: DrizzleDb,
    values: typeof limboGames.$inferInsert,
  ): Promise<typeof limboGames.$inferSelect> {
    const [row] = await tx.insert(limboGames).values(values).returning();
    if (!row) {
      throw new InternalServerErrorException('Failed to create limbo game');
    }
    return row;
  }
}
