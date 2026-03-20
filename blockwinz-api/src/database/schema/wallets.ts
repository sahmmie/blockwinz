import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  numeric,
  index,
} from 'drizzle-orm/pg-core';
import { currencyEnum, chainEnum } from './enums';
import { primaryUuidId, timestampColumns } from './common-columns';

export const wallets = pgTable(
  'wallets',
  {
    ...primaryUuidId,
    userId: uuid('user_id').notNull(),
    address: text('address').notNull(),
    privateKey: text('private_key').notNull(),
    publicKey: text('public_key').notNull(),
    isValid: boolean('is_valid').notNull().default(true),
    currency: text('currency').notNull(),
    chain: text('chain').notNull(),
    onChainBalance: numeric('on_chain_balance', { precision: 20, scale: 8 })
      .notNull()
      .default('0'),
    appBalance: numeric('app_balance', { precision: 20, scale: 8 })
      .notNull()
      .default('0'),
    pendingWithdrawal: numeric('pending_withdrawal', {
      precision: 20,
      scale: 8,
    })
      .notNull()
      .default('0'),
    lockedInBets: numeric('locked_in_bets', { precision: 20, scale: 8 })
      .notNull()
      .default('0'),
    syncedAt: timestamp('synced_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    ...timestampColumns,
  },
  (t) => [
    index('wallets_user_id_idx').on(t.userId),
    index('wallets_currency_idx').on(t.currency),
    index('wallets_chain_idx').on(t.chain),
  ],
);

export type WalletSelect = typeof wallets.$inferSelect;
export type WalletInsert = typeof wallets.$inferInsert;
