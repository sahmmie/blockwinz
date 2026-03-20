import { pgTable, uuid, text, jsonb, index } from 'drizzle-orm/pg-core';
import { primaryUuidId, timestampColumns } from './common-columns';

export const multiplayerTictactoeGames = pgTable(
  'multiplayer_tictactoe_games',
  {
    ...primaryUuidId,
    board: jsonb('board').$type<Array<Array<'X' | 'O' | ''>>>().notNull(),
    betResultStatus: text('bet_result_status').notNull(),
    players: jsonb('players')
      .$type<Array<{ playerIsNext: boolean; userId: string; userIs: string }>>()
      .notNull(),
    currentTurn: text('current_turn'),
    winner: text('winner'),
    winnerId: uuid('winner_id'),
    moveHistory: jsonb('move_history')
      .$type<
        Array<{ userId: string; row: number; col: number; timestamp: string }>
      >()
      .default([]),
    sessionId: uuid('session_id').notNull(),
    afkPlayers: uuid('afk_players').array().default([]),
    ...timestampColumns,
  },
  (t) => [
    index('multiplayer_tictactoe_session_id_idx').on(t.sessionId),
    index('multiplayer_tictactoe_bet_result_status_idx').on(t.betResultStatus),
  ],
);

export type MultiplayerTictactoeGameSelect =
  typeof multiplayerTictactoeGames.$inferSelect;
export type MultiplayerTictactoeGameInsert =
  typeof multiplayerTictactoeGames.$inferInsert;
