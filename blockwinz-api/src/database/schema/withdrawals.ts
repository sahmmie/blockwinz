import {
  pgTable,
  uuid,
  text,
  timestamp,
  numeric,
  uniqueIndex,
  index,
} from 'drizzle-orm/pg-core';
import { withdrawalStatusEnum, approvalTypeEnum } from './enums';
import { primaryUuidId, timestampColumns } from './common-columns';

export const withdrawals = pgTable(
  'withdrawals',
  {
    ...primaryUuidId,
    userId: uuid('user_id').notNull(),
    amount: numeric('amount', { precision: 20, scale: 8 }).notNull(),
    currency: text('currency').notNull(),
    destinationAddress: text('destination_address').notNull(),
    status: text('status').notNull().default('pending'),
    approvedById: uuid('approved_by_id'),
    approvedAt: timestamp('approved_at', { withTimezone: true }),
    rejectedById: uuid('rejected_by_id'),
    rejectedAt: timestamp('rejected_at', { withTimezone: true }),
    rejectionReason: text('rejection_reason'),
    requestId: text('request_id').notNull().unique(),
    processedAt: timestamp('processed_at', { withTimezone: true }),
    transactionHash: text('transaction_hash'),
    approvalType: text('approval_type').default('manual'),
    error: text('error'),
    ...timestampColumns,
  },
  (t) => [
    uniqueIndex('withdrawals_request_id_idx').on(t.requestId),
    index('withdrawals_user_id_idx').on(t.userId),
    index('withdrawals_status_idx').on(t.status),
  ],
);

export type WithdrawalSelect = typeof withdrawals.$inferSelect;
export type WithdrawalInsert = typeof withdrawals.$inferInsert;
