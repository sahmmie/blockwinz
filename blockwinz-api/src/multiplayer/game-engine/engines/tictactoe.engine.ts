import { IGameEngine } from '../base/game-engine.interface';

export type TicTacToeCell = 'X' | 'O' | null;
export type TicTacToeBoard = TicTacToeCell[][];

export class TicTacToeEngine implements IGameEngine {
  private board: TicTacToeBoard;
  private currentPlayer: string;
  private players: [string, string];
  private winner: string | null = null;
  private moveHistory: Array<{ playerId: string; row: number; col: number }>;

  constructor(players: [string, string]) {
    this.players = players;
    this.board = [
      [null, null, null],
      [null, null, null],
      [null, null, null],
    ];
    this.currentPlayer = players[0];
    this.moveHistory = [];
  }

  handleMove(playerId: string, move: { row: number; col: number }): void {
    if (!this.validateMove(playerId, move)) {
      throw new Error('Invalid move');
    }
    const symbol = this.players[0] === playerId ? 'X' : 'O';
    this.board[move.row][move.col] = symbol;
    this.moveHistory.push({ playerId, ...move });
    if (this.isGameOver()) {
      this.winner = this.getWinner();
    } else {
      this.currentPlayer = this.players.find((p) => p !== playerId)!;
    }
  }

  validateMove(
    playerId: string,
    move: { row: number; col: number },
  ): boolean | string {
    if (this.winner) return 'Game is already over';
    if (playerId !== this.currentPlayer) return 'Not your turn';
    if (move.row < 0 || move.row > 2 || move.col < 0 || move.col > 2)
      return 'Invalid cell';
    if (this.board[move.row][move.col] !== null) return 'Cell already taken';
    return true;
  }

  getGameState() {
    return {
      board: this.board,
      currentPlayer: this.currentPlayer,
      moveHistory: this.moveHistory,
      winner: this.winner,
    };
  }

  isGameOver(): boolean {
    return (
      !!this.getWinner() || this.board.flat().every((cell) => cell !== null)
    );
  }

  getWinner(): string | null {
    // Check rows, columns, diagonals
    const lines = [
      // Rows
      ...this.board,
      // Columns
      [this.board[0][0], this.board[1][0], this.board[2][0]],
      [this.board[0][1], this.board[1][1], this.board[2][1]],
      [this.board[0][2], this.board[1][2], this.board[2][2]],
      // Diagonals
      [this.board[0][0], this.board[1][1], this.board[2][2]],
      [this.board[0][2], this.board[1][1], this.board[2][0]],
    ];
    for (const line of lines) {
      if (line[0] && line[0] === line[1] && line[1] === line[2]) {
        // Return the playerId for the winner
        return line[0] === 'X' ? this.players[0] : this.players[1];
      }
    }
    return null;
  }

  getGameResult() {
    const winnerId = this.getWinner();
    let loserId = null;
    if (winnerId) {
      loserId = this.players.find((p) => p !== winnerId) || null;
    }
    const isDraw =
      !winnerId && this.board.flat().every((cell) => cell !== null);
    return {
      winnerId,
      loserId,
      isDraw,
      finalScore: this.getGameState(),
      gameId: 'tictactoe',
    };
  }
}
