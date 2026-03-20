import { TicTacToeStatus } from 'src/games/tictactoe/enums/tictactoe.enums';

export interface MultiplayerTicTacToePlayer {
  userId: string;
  userIs: string;
  playerIsNext?: boolean;
}

export interface MultiplayerTicTacToeMove {
  userId: string;
  row: number;
  col: number;
  timestamp: Date | string;
}

export interface MultiplayerTicTacToeDto {
  board: Array<Array<'X' | 'O' | ''>>;
  betResultStatus: TicTacToeStatus;
  players: MultiplayerTicTacToePlayer[];
  currentTurn: 'X' | 'O' | null;
  winner: 'X' | 'O' | null;
  winnerId: string | null;
  moveHistory: MultiplayerTicTacToeMove[];
  sessionId: string;
  afkPlayers: string[];
}
