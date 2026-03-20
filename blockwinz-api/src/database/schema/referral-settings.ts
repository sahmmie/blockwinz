import { pgTable, uuid, text, boolean, integer } from 'drizzle-orm/pg-core';
import { primaryUuidId, timestampColumns } from './common-columns';

export const referralSettings = pgTable('referral_settings', {
  ...primaryUuidId,
  minimumDepositAmount: integer('minimum_deposit_amount')
    .notNull()
    .default(100),
  rewardPercentage: integer('reward_percentage').notNull().default(10),
  maxReferralsPerUser: integer('max_referrals_per_user').notNull().default(10),
  referralCompletionTimeframe: integer('referral_completion_timeframe')
    .notNull()
    .default(30),
  referralCodePrefix: text('referral_code_prefix').notNull().default('BWZ'),
  referralCodeLength: integer('referral_code_length').notNull().default(8),
  isActive: boolean('is_active').notNull().default(true),
  ...timestampColumns,
});

export type ReferralSettingSelect = typeof referralSettings.$inferSelect;
export type ReferralSettingInsert = typeof referralSettings.$inferInsert;
