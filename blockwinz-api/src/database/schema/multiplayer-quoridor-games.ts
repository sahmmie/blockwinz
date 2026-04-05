import { pgTable, uuid, text, jsonb, index } from 'drizzle-orm/pg-core';
import { primaryUuidId, timestampColumns } from './common-columns';

export type QuoridorPlayerRow = {
  userId: string;
  position: { x: number; y: number };
  wallsRemaining: number;
};

export type QuoridorWallRow = {
  x: number;
  y: number;
  orientation: 'horizontal' | 'vertical';
};

export type QuoridorMoveHistoryRow = {
  userId: string;
  move: unknown;
  timestamp: string;
};

export const multiplayerQuoridorGames = pgTable(
  'multiplayer_quoridor_games',
  {
    ...primaryUuidId,
    sessionId: uuid('session_id').notNull(),
    betResultStatus: text('bet_result_status').notNull(),
    players: jsonb('players')
      .$type<[QuoridorPlayerRow, QuoridorPlayerRow]>()
      .notNull(),
    walls: jsonb('walls').$type<QuoridorWallRow[]>().notNull().default([]),
    currentTurnUserId: text('current_turn_user_id'),
    winnerId: uuid('winner_id'),
    moveHistory: jsonb('move_history')
      .$type<QuoridorMoveHistoryRow[]>()
      .default([]),
    ...timestampColumns,
  },
  (t) => [
    index('multiplayer_quoridor_session_id_idx').on(t.sessionId),
    index('multiplayer_quoridor_bet_result_status_idx').on(t.betResultStatus),
  ],
);

export type MultiplayerQuoridorGameSelect =
  typeof multiplayerQuoridorGames.$inferSelect;
export type MultiplayerQuoridorGameInsert =
  typeof multiplayerQuoridorGames.$inferInsert;
