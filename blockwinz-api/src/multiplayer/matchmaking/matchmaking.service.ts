import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { MatchRequest } from './match-request.interface';

@Injectable()
export class MatchmakingService {
  private readonly logger = new Logger(MatchmakingService.name);
  private readonly pools: Map<string, MatchRequest[]> = new Map();

  constructor(private readonly eventEmitter: EventEmitter2) {}

  /**
   * Request a match for a player. Tries to find a compatible match or queues the request.
   * Emits 'match.found' event if a match is found.
   * @param request MatchRequest
   */
  requestMatch(request: MatchRequest): void {
    const key = this.getPoolKey(request.gameId, request.betAmount);
    const pool = this.pools.get(key) || [];

    // Try to find a compatible match (for now, just any other player in the pool)
    if (pool.length > 0) {
      const opponent = pool.shift();
      this.pools.set(key, pool); // update pool
      this.logger.log(`Match found: ${request.userId} vs ${opponent.userId}`);
      this.eventEmitter.emit('match.found', {
        player1: opponent,
        player2: request,
      });
    } else {
      pool.push(request);
      this.pools.set(key, pool);
      this.logger.log(
        `Player queued: ${request.userId} for game ${request.gameId} (${request.betAmount})`,
      );
    }
  }

  /**
   * Helper to generate a pool key based on gameId and betAmount
   */
  private getPoolKey(gameId: string, betAmount: number): string {
    return `${gameId}:${betAmount}`;
  }
}
