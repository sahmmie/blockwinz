import { pgTable, uuid, text, timestamp, boolean } from 'drizzle-orm/pg-core';
import { primaryUuidId, timestampColumns } from './common-columns';

export const otps = pgTable('otps', {
  ...primaryUuidId,
  email: text('email').notNull(),
  otp: text('otp').notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  isUsed: boolean('is_used').default(false),
  ...timestampColumns,
});

export type OtpSelect = typeof otps.$inferSelect;
export type OtpInsert = typeof otps.$inferInsert;
