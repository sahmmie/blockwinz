import { uuid, text, boolean, integer, numeric } from 'drizzle-orm/pg-core';
import { timestampColumns } from './common-columns';

/**
 * Shared column definitions for all game tables.
 * Spread into each game table: ...gamesCommonColumns
 */
export const gamesCommonColumns = {
  userId: uuid('user_id').notNull(),
  seedId: uuid('seed_id').notNull(),
  betAmount: numeric('bet_amount', { precision: 20, scale: 8 }).notNull(),
  totalWinAmount: numeric('total_win_amount', { precision: 20, scale: 8 }),
  currency: text('currency').notNull(),
  multiplier: numeric('multiplier', { precision: 20, scale: 8 }).notNull(),
  nonce: integer('nonce').notNull(),
  stopOnProfit: numeric('stop_on_profit', { precision: 20, scale: 8 }),
  stopOnLoss: numeric('stop_on_loss', { precision: 20, scale: 8 }),
  increaseBy: numeric('increase_by', { precision: 20, scale: 8 }),
  decreaseBy: numeric('decrease_by', { precision: 20, scale: 8 }),
  isManualMode: boolean('is_manual_mode').default(false),
  isTurboMode: boolean('is_turbo_mode').default(false),
  ...timestampColumns,
};
