import { pgTable, uuid, text, numeric, index } from 'drizzle-orm/pg-core';
import { primaryUuidId, timestampColumns } from './common-columns';

export const betHistories = pgTable(
  'bet_histories',
  {
    ...primaryUuidId,
    userId: uuid('user_id').notNull(),
    gameId: uuid('game_id').notNull(),
    gameType: text('game_type').notNull(),
    betAmount: numeric('bet_amount', { precision: 20, scale: 8 }).notNull(),
    totalWinAmount: numeric('total_win_amount', { precision: 20, scale: 8 }),
    ...timestampColumns,
  },
  (t) => [
    index('bet_histories_user_id_created_at_idx').on(t.userId, t.createdAt),
  ],
);

export type BetHistorySelect = typeof betHistories.$inferSelect;
export type BetHistoryInsert = typeof betHistories.$inferInsert;
