/**
 * UI / routing game list (may include titles not yet persisted in db_game_schema).
 * For API payloads that must round-trip the DB, prefer DbGameSchema.
 */
export enum GameTypeEnum {
  DiceGame = 'DiceGame',
  LimboGame = 'LimboGame',
  CoinFlipGame = 'CoinFlipGame',
  CrashGame = 'CrashGame',
  KenoGame = 'KenoGame',
  PlinkoGame = 'PlinkoGame',
  RouletteGame = 'RouletteGame',
  MinesGame = 'MinesGame',
  BlackjackGame = 'BlackjackGame',
  WheelGame = 'WheelGame',
  BaccaratGame = 'BaccaratGame',
  HiloGame = 'HiloGame',
}

export enum GameCategoryEnum {
  ALL = 'all',
  ORIGINALS = 'originals',
  MULTIPLAYER = 'multiplayer',
  SPORTS = 'sports',
}

/** Multiplayer catalogue (UI + routes). Backend may only implement a subset; see `DbGameSchema` for persisted IDs. */
export enum MultiplayerGameTypeEnum {
  TicTacToeGame = 'TicTacToeGame',
  QuoridorGame = 'QuoridorGame',
  CoinFlipGame = 'CoinFlipGame',
  RPSGame = 'RPSGame',
  DiceDuelGame = 'DiceDuelGame',
  ConnectFourGame = 'ConnectFourGame',
  DotsBoxesGame = 'DotsBoxesGame',
  MemoryGame = 'MemoryGame',
  CrashGame = 'CrashGame',
  JackpotGame = 'JackpotGame',
  LuckyNumbersGame = 'LuckyNumbersGame',
  BattleshipGame = 'BattleshipGame',
  CheckersGame = 'CheckersGame',
  DominoesGame = 'DominoesGame',
}

export enum GameMode {
  Auto = 'auto',
  Manual = 'manual',
  Advanced = 'advanced',
}
