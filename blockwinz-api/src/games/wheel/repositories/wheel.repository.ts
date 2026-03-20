import { Injectable, InternalServerErrorException } from '@nestjs/common';
import type { DrizzleDb } from 'src/database/database.module';
import { wheelGames } from 'src/database/schema/wheel-games';

@Injectable()
export class WheelRepository {
  async insertWheelGame(
    tx: DrizzleDb,
    values: typeof wheelGames.$inferInsert,
  ): Promise<typeof wheelGames.$inferSelect> {
    const [row] = await tx.insert(wheelGames).values(values).returning();
    if (!row) {
      throw new InternalServerErrorException('Failed to create wheel game');
    }
    return row;
  }
}
