import { pgTable, uuid, text, jsonb, index } from 'drizzle-orm/pg-core';
import { primaryUuidId, timestampColumns } from './common-columns';

export const favourites = pgTable(
  'favourites',
  {
    ...primaryUuidId,
    userId: uuid('user_id').notNull(),
    games: jsonb('games')
      .$type<Array<{ game: string; addedAt: string }>>()
      .default([]),
    ...timestampColumns,
  },
  (t) => [index('favourites_user_id_idx').on(t.userId)],
);

export type FavouriteSelect = typeof favourites.$inferSelect;
export type FavouriteInsert = typeof favourites.$inferInsert;
