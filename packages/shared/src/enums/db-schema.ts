/** Persisted / API game identifiers (subset of UI `GameTypeEnum`). Drives `db_game_schema` in Postgres. */
export enum DbGameSchema {
  DiceGame = 'DiceGame',
  LimboGame = 'LimboGame',
  CoinFlipGame = 'CoinFlipGame',
  CrashGame = 'CrashGame',
  KenoGame = 'KenoGame',
  PlinkoGame = 'PlinkoGame',
  RouletteGame = 'RouletteGame',
  MinesGame = 'MinesGame',
  WheelGame = 'WheelGame',
  TicTacToeGame = 'TicTacToeGame',
  QuoridorGame = 'QuoridorGame',
}
