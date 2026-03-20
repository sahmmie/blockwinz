import { pgTable, text, integer, index } from 'drizzle-orm/pg-core';
import { gamesCommonColumns } from './games-common';
import { primaryUuidId } from './common-columns';

export const minesGames = pgTable(
  'mines_games',
  {
    ...primaryUuidId,
    ...gamesCommonColumns,
    betResultStatus: text('bet_result_status').notNull(),
    minesCount: integer('mines_count').notNull(),
    selected: integer('selected').array().notNull(),
    minesResult: integer('mines_result').array().notNull(),
  },
  (t) => [
    index('mines_games_user_id_idx').on(t.userId),
    index('mines_games_created_at_idx').on(t.createdAt),
    index('mines_games_seed_id_idx').on(t.seedId),
    index('mines_games_user_id_bet_status_idx').on(t.userId, t.betResultStatus),
  ],
);

export type MinesGameSelect = typeof minesGames.$inferSelect;
export type MinesGameInsert = typeof minesGames.$inferInsert;
