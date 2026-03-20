import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FavouriteDto } from '../dtos/favourite.dto';
import { DbGameSchema } from 'src/shared/enums/dbSchema.enum';
import { DRIZZLE } from 'src/database/constants';
import type { DrizzleDb } from 'src/database/database.module';
import { favourites } from 'src/database/schema/favourites';
import { eq } from 'drizzle-orm';
import type {
  FavouriteSelect,
  FavouriteInsert,
} from 'src/database/schema/favourites';

type FavouriteGame = { game: string; addedAt: string };

@Injectable()
export class FavouriteRepository {
  constructor(
    @Inject(ConfigService) public config: ConfigService,
    @Inject(DRIZZLE) private readonly db: DrizzleDb,
  ) {}

  async addToFavourites(
    userId: string,
    game: DbGameSchema,
  ): Promise<FavouriteDto> {
    const userIdStr = String(userId);
    const [existing] = await this.db
      .select()
      .from(favourites)
      .where(eq(favourites.userId, userIdStr))
      .limit(1);

    const gamesList = (existing?.games ?? []) as FavouriteGame[];
    const alreadyExists = gamesList.some((g) => g.game === game);

    if (existing) {
      if (!alreadyExists) {
        const newGames: FavouriteGame[] = [
          ...gamesList,
          { game, addedAt: new Date().toISOString() },
        ];
        await this.db
          .update(favourites)
          .set({
            games: newGames,
            updatedAt: new Date(),
          } as Partial<FavouriteSelect>)
          .where(eq(favourites.id, existing.id));
        const [updated] = await this.db
          .select()
          .from(favourites)
          .where(eq(favourites.id, existing.id))
          .limit(1);
        return this.rowToDto(updated ?? { ...existing, games: newGames });
      }
      return this.rowToDto(existing);
    }

    const [row] = await this.db
      .insert(favourites)
      .values({
        userId: userIdStr,
        games: [{ game, addedAt: new Date().toISOString() }],
      } as FavouriteInsert)
      .returning();
    if (!row) throw new Error('Failed to create favourite');
    return this.rowToDto(row);
  }

  async removeFromFavourites(
    userId: string,
    game: string,
  ): Promise<FavouriteDto | null> {
    const userIdStr = String(userId);
    const [existing] = await this.db
      .select()
      .from(favourites)
      .where(eq(favourites.userId, userIdStr))
      .limit(1);
    if (!existing) return null;

    const gamesList = (existing.games ?? []) as FavouriteGame[];
    const newGames = gamesList.filter((g) => g.game !== game);

    await this.db
      .update(favourites)
      .set({
        games: newGames,
        updatedAt: new Date(),
      } as Partial<FavouriteSelect>)
      .where(eq(favourites.id, existing.id));

    const [updated] = await this.db
      .select()
      .from(favourites)
      .where(eq(favourites.id, existing.id))
      .limit(1);
    return updated ? this.rowToDto(updated) : null;
  }

  async getUserFavourites(userId: string): Promise<FavouriteDto | null> {
    const userIdStr = String(userId);
    const [row] = await this.db
      .select()
      .from(favourites)
      .where(eq(favourites.userId, userIdStr))
      .limit(1);
    return row ? this.rowToDto(row) : null;
  }

  private rowToDto(
    row: FavouriteSelect | (FavouriteSelect & { games: FavouriteGame[] }),
  ): FavouriteDto {
    const gamesList = (row.games ?? []) as FavouriteGame[];
    return {
      user: row.userId as unknown as FavouriteDto['user'],
      games: gamesList.map((g) => ({
        game: g.game as DbGameSchema,
        addedAt: new Date(g.addedAt),
      })),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}
