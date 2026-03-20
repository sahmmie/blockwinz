import { pgTable, text, jsonb, index } from 'drizzle-orm/pg-core';
import { gamesCommonColumns } from './games-common';
import { primaryUuidId } from './common-columns';

export const tictactoeGames = pgTable(
  'tictactoe_games',
  {
    ...primaryUuidId,
    ...gamesCommonColumns,
    board: jsonb('board').$type<Array<Array<'X' | 'O' | ''>>>(),
    betResultStatus: text('bet_result_status').notNull(),
    userIs: text('user_is').notNull().default('O'),
    aiIs: text('ai_is').notNull().default('X'),
    currentTurn: text('current_turn'),
    risk: text('risk').notNull(),
  },
  (t) => [
    index('tictactoe_games_user_id_idx').on(t.userId),
    index('tictactoe_games_created_at_idx').on(t.createdAt),
  ],
);

export type TicTacToeGameSelect = typeof tictactoeGames.$inferSelect;
export type TicTacToeGameInsert = typeof tictactoeGames.$inferInsert;
