export interface MatchRequest {
  userId: string;
  /** `DbGameSchema` value, e.g. `TicTacToeGame`. */
  gameId: string;
  betAmount: number;
  currency: string;
  mode: 'RANDOM_PUBLIC';
}
