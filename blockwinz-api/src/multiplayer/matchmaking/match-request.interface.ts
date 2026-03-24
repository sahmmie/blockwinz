export interface MatchRequest {
  userId: string;
  /** `DbGameSchema` value, e.g. `TicTacToeGame`. */
  gameId: string;
  betAmount: number;
  currency: string;
  mode: 'RANDOM_PUBLIC';
  /**
   * When true (default if omitted), only same stake pairs (per-amount Redis pool).
   * When false, flex pool: pair with any stake in the same currency; table stake is min(both).
   */
  betAmountMustEqual?: boolean;
}
