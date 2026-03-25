import {
  pgTable,
  uuid,
  text,
  boolean,
  numeric,
  integer,
  timestamp,
  index,
} from 'drizzle-orm/pg-core';
import { primaryUuidId, timestampColumns } from './common-columns';

/** Who can see / join a multiplayer lobby from the public list. */
export const multiplayerLobbyVisibility = ['public', 'private'] as const;
export type MultiplayerLobbyVisibility =
  (typeof multiplayerLobbyVisibility)[number];

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
    visibility: text('visibility').notNull().default('public'),
    hostUserId: uuid('host_user_id'),
    /** True while host stake is held for an open lobby (released on cancel or when gameplay locks all players). */
    hostLobbyStakeLocked: boolean('host_lobby_stake_locked')
      .notNull()
      .default(false),
    maxPlayers: integer('max_players').notNull().default(2),
    joinCodeHash: text('join_code_hash'),
    spectatorsAllowed: boolean('spectators_allowed').notNull().default(false),
    spectatorUserIds: uuid('spectator_user_ids').array().notNull().default([]),
    turnDeadlineAt: timestamp('turn_deadline_at', { withTimezone: true }),
    settledAt: timestamp('settled_at', { withTimezone: true }),
    reconnectGraceUntil: timestamp('reconnect_grace_until', {
      withTimezone: true,
    }),
    ...timestampColumns,
  },
  (t) => [
    index('game_sessions_game_id_idx').on(t.gameId),
    index('game_sessions_players_idx').on(t.players),
    index('game_sessions_game_status_idx').on(t.gameStatus),
    index('game_sessions_visibility_status_idx').on(t.visibility, t.gameStatus),
    index('game_sessions_game_type_status_idx').on(t.gameType, t.gameStatus),
  ],
);

export type GameSessionSelect = typeof gameSessions.$inferSelect;
export type GameSessionInsert = typeof gameSessions.$inferInsert;
