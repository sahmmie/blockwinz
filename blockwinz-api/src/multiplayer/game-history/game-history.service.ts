import { Injectable, Logger } from '@nestjs/common';

export interface GameResult {
  sessionId: string;
  gameId: string;
  players: string[];
  moves?: any[];
  finalState: any;
  winner: string | null;
  betAmount: number;
  createdAt: Date;
  finishedAt: Date;
}

@Injectable()
export class GameHistoryService {
  private readonly logger = new Logger(GameHistoryService.name);
  private readonly results: GameResult[] = [];

  async saveGameResult(result: GameResult): Promise<void> {
    this.results.push(result);
    this.logger.log(`Game result saved for session ${result.sessionId}`);
  }

  getAllResults(): GameResult[] {
    return this.results;
  }
}
