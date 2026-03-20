import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  numeric,
  jsonb,
  index,
} from 'drizzle-orm/pg-core';
import { referralStatusEnum } from './enums';
import { primaryUuidId } from './common-columns';

export const referrals = pgTable(
  'referrals',
  {
    ...primaryUuidId,
    referrer: text('referrer').notNull(),
    referred: text('referred').notNull(),
    status: text('status').notNull().default('pending'),
    rewardAmount: numeric('reward_amount', { precision: 20, scale: 8 })
      .notNull()
      .default('0'),
    conditions: jsonb('conditions').notNull(),
    progress: jsonb('progress').notNull(),
    history: jsonb('history').notNull(),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    index('referrals_referrer_idx').on(t.referrer),
    index('referrals_referred_idx').on(t.referred),
    index('referrals_expires_at_idx').on(t.expiresAt),
  ],
);

export type ReferralSelect = typeof referrals.$inferSelect;
export type ReferralInsert = typeof referrals.$inferInsert;
