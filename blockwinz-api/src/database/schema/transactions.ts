import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  numeric,
  index,
  jsonb,
} from 'drizzle-orm/pg-core';
import { primaryUuidId, timestampColumns } from './common-columns';

export const transactions = pgTable(
  'transactions',
  {
    ...primaryUuidId,
    userId: uuid('user_id').notNull(),
    type: text('type').notNull(),
    status: text('status').notNull(),
    fulfillmentDate: timestamp('fulfillment_date', { withTimezone: true }),
    transactionAmount: numeric('transaction_amount', {
      precision: 20,
      scale: 8,
    }).notNull(),
    gameId: uuid('game_id'),
    gameModel: text('game_model'),
    txid: text('txid'),
    metadata: jsonb('metadata'),
    onChain: boolean('on_chain').default(false),
    chain: text('chain'),
    currency: text('currency'),
    withdrawalId: uuid('withdrawal_id'),
    ...timestampColumns,
  },
  (t) => [
    index('transactions_user_id_idx').on(t.userId),
    index('transactions_game_id_idx').on(t.gameId),
    index('transactions_type_idx').on(t.type),
  ],
);

export type TransactionSelect = typeof transactions.$inferSelect;
export type TransactionInsert = typeof transactions.$inferInsert;
