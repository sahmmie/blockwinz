import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  integer,
  numeric,
  uniqueIndex,
  index,
} from 'drizzle-orm/pg-core';
import { primaryUuidId } from './common-columns';

export const coupons = pgTable(
  'coupons',
  {
    ...primaryUuidId,
    code: text('code').notNull().unique(),
    rewardAmount: numeric('reward_amount', {
      precision: 20,
      scale: 8,
    }).notNull(),
    rewardType: text('reward_type').notNull(),
    expiryDate: timestamp('expiry_date', { withTimezone: true }).notNull(),
    maxRedemptions: integer('max_redemptions').notNull().default(1),
    isActive: boolean('is_active').notNull().default(true),
    requiredTasks: text('required_tasks').array().default([]),
    minimumDepositAmount: numeric('minimum_deposit_amount', {
      precision: 20,
      scale: 8,
    }).default('0'),
    minGamesPlayed: integer('min_games_played').default(0),
    claimDelayInHours: integer('claim_delay_in_hours').default(0),
    loginStreakRequired: integer('login_streak_required').default(0),
    customConditionFnName: text('custom_condition_fn_name'),
    redeemedBy: text('redeemed_by').array().default([]),
    currentRedemptions: integer('current_redemptions').default(0),
    description: text('description'),
    createdAt: timestamp('created_at', { withTimezone: true }),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    uniqueIndex('coupons_code_idx').on(t.code),
    index('coupons_expiry_date_idx').on(t.expiryDate),
    index('coupons_is_active_idx').on(t.isActive),
  ],
);

export type CouponSelect = typeof coupons.$inferSelect;
export type CouponInsert = typeof coupons.$inferInsert;
