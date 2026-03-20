import { pgTable, numeric, text, index } from 'drizzle-orm/pg-core';
import { gamesCommonColumns } from './games-common';
import { primaryUuidId } from './common-columns';

export const limboGames = pgTable(
  'limbo_games',
  {
    ...primaryUuidId,
    ...gamesCommonColumns,
    betResultNumber: numeric('bet_result_number', { precision: 20, scale: 8 }),
    betResultStatus: text('bet_result_status').notNull(),
  },
  (t) => [
    index('limbo_games_user_id_idx').on(t.userId),
    index('limbo_games_created_at_idx').on(t.createdAt),
    index('limbo_games_seed_id_idx').on(t.seedId),
  ],
);

export type LimboGameSelect = typeof limboGames.$inferSelect;
export type LimboGameInsert = typeof limboGames.$inferInsert;
