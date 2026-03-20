import { uuid, timestamp } from 'drizzle-orm/pg-core';

/**
 * Shared primary key column for tables using UUID.
 * Use: ...primaryUuidId
 */
export const primaryUuidId = {
  id: uuid('id').primaryKey().defaultRandom(),
};

/**
 * Shared createdAt/updatedAt columns.
 * Use: ...timestampColumns
 */
export const timestampColumns = {
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
};
