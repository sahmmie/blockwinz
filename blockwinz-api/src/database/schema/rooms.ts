import {
  pgTable,
  uuid,
  text,
  boolean,
  jsonb,
  uniqueIndex,
  index,
} from 'drizzle-orm/pg-core';
import { primaryUuidId, timestampColumns } from './common-columns';

export const rooms = pgTable(
  'rooms',
  {
    ...primaryUuidId,
    name: text('name').notNull().unique(),
    isActive: boolean('is_active').default(true),
    isPrivate: boolean('is_private').default(false),
    createdById: uuid('created_by_id'),
    roomType: text('room_type').notNull().default('chat'),
    members: jsonb('members')
      .$type<
        Array<{
          userId: string;
          canSend: boolean;
          isViewer: boolean;
          joinedAt: string;
        }>
      >()
      .default([]),
    ...timestampColumns,
  },
  (t) => [
    uniqueIndex('rooms_name_idx').on(t.name),
    index('rooms_room_type_idx').on(t.roomType),
  ],
);

export type RoomSelect = typeof rooms.$inferSelect;
export type RoomInsert = typeof rooms.$inferInsert;
