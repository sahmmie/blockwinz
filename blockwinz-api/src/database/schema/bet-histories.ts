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
    /** Lowercase currency code (e.g. sol, bwz) — matches wallet / Currency enum */
    currency: text('currency').notNull().default('sol'),
    /** When stake was specified in USD (SOL wallet), the client-requested USD amount */
    usdAmountRequested: numeric('usd_amount_requested', {
      precision: 20,
      scale: 8,
    }),
    /** Effective USD per 1 SOL at bet time (usd_amount_requested / bet_amount in SOL) */
    solUsdRateAtBet: numeric('sol_usd_rate_at_bet', {
      precision: 20,
      scale: 8,
    }),
    /** Game multiplier at resolution (target mult, wheel segment mult, payout ratio, etc.) */
    multiplier: numeric('multiplier', { precision: 20, scale: 8 }),
    ...timestampColumns,
  },
  (t) => [
    index('bet_histories_user_id_created_at_idx').on(t.userId, t.createdAt),
  ],
);

export type BetHistorySelect = typeof betHistories.$inferSelect;
export type BetHistoryInsert = typeof betHistories.$inferInsert;
