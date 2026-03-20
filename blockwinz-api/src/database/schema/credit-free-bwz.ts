import {
  pgTable,
  uuid,
  text,
  integer,
  jsonb,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { primaryUuidId, timestampColumns } from './common-columns';

export const creditFreeBwz = pgTable(
  'credit_free_bwz',
  {
    ...primaryUuidId,
    username: text('username').notNull().unique(),
    sendHistory: jsonb('send_history')
      .$type<
        Array<{
          amount: number;
          timestamp: string;
          signature: string;
          walletAddress: string;
        }>
      >()
      .default([]),
    totalSent: integer('total_sent').default(0),
    ...timestampColumns,
  },
  (t) => [uniqueIndex('credit_free_bwz_username_idx').on(t.username)],
);

export type CreditFreeBwzSelect = typeof creditFreeBwz.$inferSelect;
export type CreditFreeBwzInsert = typeof creditFreeBwz.$inferInsert;
