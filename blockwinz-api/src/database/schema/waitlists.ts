import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { primaryUuidId, timestampColumns } from './common-columns';

export const waitlists = pgTable(
  'waitlists',
  {
    ...primaryUuidId,
    email: text('email').notNull(),
    isActive: boolean('is_active').default(false),
    joinedAt: timestamp('joined_at', { withTimezone: true }).defaultNow(),
    ...timestampColumns,
  },
  (t) => [uniqueIndex('waitlists_email_idx').on(t.email)],
);

export type WaitlistSelect = typeof waitlists.$inferSelect;
export type WaitlistInsert = typeof waitlists.$inferInsert;
