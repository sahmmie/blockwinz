import { pgTable, uuid, text, timestamp, index } from 'drizzle-orm/pg-core';
import { primaryUuidId, timestampColumns } from './common-columns';

export const messages = pgTable(
  'messages',
  {
    ...primaryUuidId,
    userId: uuid('user_id').notNull(),
    username: text('username').notNull(),
    roomId: uuid('room_id').notNull(),
    roomName: text('room_name').notNull(),
    content: text('content').notNull(),
    timestamp: timestamp('timestamp', { withTimezone: true }).defaultNow(),
    ...timestampColumns,
  },
  (t) => [index('messages_room_name_idx').on(t.roomName)],
);

export type MessageSelect = typeof messages.$inferSelect;
export type MessageInsert = typeof messages.$inferInsert;
