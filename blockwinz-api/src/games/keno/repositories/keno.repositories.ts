import { Injectable, InternalServerErrorException } from '@nestjs/common';
import type { DrizzleDb } from 'src/database/database.module';
import { kenoGames } from 'src/database/schema/keno-games';

@Injectable()
export class KenoRepository {
  async insertKenoGame(
    tx: DrizzleDb,
    values: typeof kenoGames.$inferInsert,
  ): Promise<typeof kenoGames.$inferSelect> {
    const [row] = await tx.insert(kenoGames).values(values).returning();
    if (!row) {
      throw new InternalServerErrorException('Failed to create keno game');
    }
    return row;
  }
}
