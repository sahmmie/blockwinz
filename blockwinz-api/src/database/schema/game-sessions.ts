import {
  pgTable,
  uuid,
  text,
  boolean,
  numeric,
  jsonb,
  index,
} from 'drizzle-orm/pg-core';
import { primaryUuidId, timestampColumns } from './common-columns';

export const gameSessions = pgTable(
  'game_sessions',
  {
    ...primaryUuidId,
    userId: uuid('user_id').notNull(),
    gameId: uuid('game_id'),
    gameType: text('game_type').notNull(),
    players: uuid('players').array().notNull().default([]),
    betAmount: numeric('bet_amount', { precision: 20, scale: 8 }).notNull(),
    betAmountMustEqual: boolean('bet_amount_must_equal').default(false),
    currency: text('currency').notNull(),
    gameStatus: text('game_status').notNull(),
    invitedPlayers: uuid('invited_players').array().default([]),
    invitedEmail: text('invited_email').array().default([]),
    ...timestampColumns,
  },
  (t) => [
    index('game_sessions_game_id_idx').on(t.gameId),
    index('game_sessions_players_idx').on(t.players),
    index('game_sessions_game_status_idx').on(t.gameStatus),
  ],
);

export type GameSessionSelect = typeof gameSessions.$inferSelect;
export type GameSessionInsert = typeof gameSessions.$inferInsert;
