import { pgTable, text, integer, numeric, index } from 'drizzle-orm/pg-core';
import { gamesCommonColumns } from './games-common';
import { primaryUuidId } from './common-columns';

export const wheelGames = pgTable(
  'wheel_games',
  {
    ...primaryUuidId,
    ...gamesCommonColumns,
    risk: text('risk').notNull(),
    segments: integer('segments').notNull(),
    betResultStatus: text('bet_result_status'),
    betResultNumber: numeric('bet_result_number', { precision: 20, scale: 8 }),
  },
  (t) => [
    index('wheel_games_user_id_idx').on(t.userId),
    index('wheel_games_created_at_idx').on(t.createdAt),
    index('wheel_games_seed_id_idx').on(t.seedId),
  ],
);

export type WheelGameSelect = typeof wheelGames.$inferSelect;
export type WheelGameInsert = typeof wheelGames.$inferInsert;
