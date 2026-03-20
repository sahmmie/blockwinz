import { Injectable, InternalServerErrorException } from '@nestjs/common';
import type { DrizzleDb } from 'src/database/database.module';
import { diceGames } from 'src/database/schema/dice-games';

@Injectable()
export class DiceRepository {

  async insertDiceGame(
    tx: DrizzleDb,
    values: typeof diceGames.$inferInsert,
  ): Promise<typeof diceGames.$inferSelect> {
    const [row] = await tx.insert(diceGames).values(values).returning();
    if (!row) {
      throw new InternalServerErrorException('Failed to create dice game');
    }
    return row;
  }
}
