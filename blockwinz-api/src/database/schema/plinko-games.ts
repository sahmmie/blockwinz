import { pgTable, text, integer, index } from 'drizzle-orm/pg-core';
import { gamesCommonColumns } from './games-common';
import { primaryUuidId } from './common-columns';

export const plinkoGames = pgTable(
  'plinko_games',
  {
    ...primaryUuidId,
    ...gamesCommonColumns,
    rows: integer('rows').notNull(),
    risk: text('risk').notNull(),
    results: integer('results').array().notNull(),
  },
  (t) => [
    index('plinko_games_user_id_idx').on(t.userId),
    index('plinko_games_created_at_idx').on(t.createdAt),
    index('plinko_games_seed_id_idx').on(t.seedId),
  ],
);

export type PlinkoGameSelect = typeof plinkoGames.$inferSelect;
export type PlinkoGameInsert = typeof plinkoGames.$inferInsert;
