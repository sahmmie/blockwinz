import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class MetricsService {
  private readonly logger = new Logger(MetricsService.name);
  private gamesPlayed = 0;
  private activePlayers = new Set<string>();
  private abandonedGames = 0;
  private winCounts: Map<string, number> = new Map();

  logGamePlayed(players: string[]) {
    this.gamesPlayed++;
    players.forEach((p) => this.activePlayers.add(p));
    this.logger.log(`Game played. Total: ${this.gamesPlayed}`);
  }

  logGameAbandoned() {
    this.abandonedGames++;
    this.logger.warn(`Game abandoned. Total: ${this.abandonedGames}`);
  }

  logWin(winner: string) {
    this.winCounts.set(winner, (this.winCounts.get(winner) || 0) + 1);
    this.logger.log(
      `Player ${winner} win count: ${this.winCounts.get(winner)}`,
    );
  }

  getStats() {
    return {
      gamesPlayed: this.gamesPlayed,
      activePlayers: Array.from(this.activePlayers),
      abandonedGames: this.abandonedGames,
      winCounts: Array.from(this.winCounts.entries()),
    };
  }
}
