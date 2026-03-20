export interface IGameEngine {
  handleMove(playerId: string, move: any): void;
  validateMove(playerId: string, move: any): boolean | string;
  getGameState(): any;
  isGameOver(): boolean;
  getWinner(): string | null;
  getGameResult(): {
    winnerId: string | null;
    loserId: string | null;
    isDraw: boolean;
    finalScore: any;
    gameId: string;
  };
}
