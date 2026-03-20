import { Injectable, InternalServerErrorException } from '@nestjs/common';
import type { DrizzleDb } from 'src/database/database.module';
import { plinkoGames } from 'src/database/schema/plinko-games';

@Injectable()
export class PlinkoRepository {
  async insertPlinkoGame(
    tx: DrizzleDb,
    values: typeof plinkoGames.$inferInsert,
  ): Promise<typeof plinkoGames.$inferSelect> {
    const [row] = await tx.insert(plinkoGames).values(values).returning();
    if (!row) {
      throw new InternalServerErrorException('Failed to create plinko game');
    }
    return row;
  }
}
