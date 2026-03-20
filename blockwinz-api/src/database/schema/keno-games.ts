import { pgTable, text, integer, index } from 'drizzle-orm/pg-core';
import { gamesCommonColumns } from './games-common';
import { primaryUuidId } from './common-columns';

export const kenoGames = pgTable(
  'keno_games',
  {
    ...primaryUuidId,
    ...gamesCommonColumns,
    selectedNumbers: integer('selected_numbers').array().notNull(),
    resultNumbers: integer('result_numbers').array().notNull(),
    risk: text('risk').notNull(),
  },
  (t) => [
    index('keno_games_user_id_idx').on(t.userId),
    index('keno_games_created_at_idx').on(t.createdAt),
    index('keno_games_seed_id_idx').on(t.seedId),
  ],
);

export type KenoGameSelect = typeof kenoGames.$inferSelect;
export type KenoGameInsert = typeof kenoGames.$inferInsert;
