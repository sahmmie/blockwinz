import { pgTable, text, integer, numeric, index } from 'drizzle-orm/pg-core';
import { gamesCommonColumns } from './games-common';
import { primaryUuidId } from './common-columns';

export const coinflipGames = pgTable(
  'coinflip_games',
  {
    ...primaryUuidId,
    ...gamesCommonColumns,
    risk: text('risk').notNull(),
    coins: integer('coins').notNull(),
    side: integer('side').notNull(),
    min: integer('min').notNull(),
    results: integer('results').array().notNull(),
    betResultStatus: text('bet_result_status').notNull(),
  },
  (t) => [
    index('coinflip_games_user_id_idx').on(t.userId),
    index('coinflip_games_created_at_idx').on(t.createdAt),
    index('coinflip_games_seed_id_idx').on(t.seedId),
  ],
);

export type CoinflipGameSelect = typeof coinflipGames.$inferSelect;
export type CoinflipGameInsert = typeof coinflipGames.$inferInsert;
