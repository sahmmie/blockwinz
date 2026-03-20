import { pgTable, text, numeric, index } from 'drizzle-orm/pg-core';
import { gamesCommonColumns } from './games-common';
import { primaryUuidId } from './common-columns';

export const diceGames = pgTable(
  'dice_games',
  {
    ...primaryUuidId,
    ...gamesCommonColumns,
    rollOverBet: numeric('roll_over_bet', {
      precision: 20,
      scale: 8,
    }).notNull(),
    betResultFloat: numeric('bet_result_float', {
      precision: 20,
      scale: 8,
    }).notNull(),
    betResultStatus: text('bet_result_status').notNull(),
    direction: text('direction').notNull(),
  },
  (t) => [
    index('dice_games_user_id_idx').on(t.userId),
    index('dice_games_created_at_idx').on(t.createdAt),
    index('dice_games_seed_id_idx').on(t.seedId),
  ],
);

export type DiceGameSelect = typeof diceGames.$inferSelect;
export type DiceGameInsert = typeof diceGames.$inferInsert;
