import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  integer,
  index,
} from 'drizzle-orm/pg-core';
import { primaryUuidId, timestampColumns } from './common-columns';

export const profiles = pgTable(
  'profiles',
  {
    ...primaryUuidId,
    userId: uuid('user_id').notNull().unique(),
    isHotKeysActive: boolean('is_hot_keys_active').notNull().default(false),
    canWithdraw: boolean('can_withdraw').notNull().default(false),
    isMuted: boolean('is_muted').notNull().default(false),
    isBanned: boolean('is_banned').notNull().default(false),
    isTurbo: boolean('is_turbo').notNull().default(false),
    referralCode: text('referral_code'),
    referredBy: text('referred_by'),
    referralCount: integer('referral_count').notNull().default(0),
    referralEarnings: integer('referral_earnings').notNull().default(0),
    ...timestampColumns,
  },
  (t) => [
    index('profiles_user_id_idx').on(t.userId),
    index('profiles_referral_code_idx').on(t.referralCode),
    index('profiles_referred_by_idx').on(t.referredBy),
  ],
);

export type ProfileSelect = typeof profiles.$inferSelect;
export type ProfileInsert = typeof profiles.$inferInsert;
