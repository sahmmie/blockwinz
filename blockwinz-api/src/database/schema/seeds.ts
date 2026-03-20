import { pgTable, uuid, text, timestamp, index } from 'drizzle-orm/pg-core';
import { primaryUuidId, timestampColumns } from './common-columns';

export const seeds = pgTable(
  'seeds',
  {
    ...primaryUuidId,
    status: text('status').notNull(),
    clientSeed: text('client_seed').notNull(),
    serverSeed: text('server_seed').notNull(),
    serverSeedHash: text('server_seed_hash').notNull(),
    deactivatedAt: timestamp('deactivated_at', { withTimezone: true }),
    userId: uuid('user_id'),
    ...timestampColumns,
  },
  (t) => [index('seeds_user_id_idx').on(t.userId)],
);

export type SeedSelect = typeof seeds.$inferSelect;
export type SeedInsert = typeof seeds.$inferInsert;
