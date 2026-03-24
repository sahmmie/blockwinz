import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DbGameSchema, MultiplayerGameEmitterEvent, QuickMatchResponseStatus } from '@blockwinz/shared';
import { RedisService } from 'src/shared/services/redis.service';
import { MatchRequest } from './match-request.interface';

const QUEUE_TTL_SEC = 600;

/**
 * Redis-backed FIFO pairing for quick match (horizontal scaling safe vs in-memory pools).
 */
@Injectable()
export class MatchmakingService {
  private readonly logger = new Logger(MatchmakingService.name);

  constructor(
    private readonly eventEmitter: EventEmitter2,
    private readonly redisService: RedisService,
  ) {}

  /**
   * Enqueues the player or immediately pairs with another waiter and emits `match.found`.
   *
   * @returns `WAITING` if queued, or `MATCHED` if this call created the pair.
   */
  async requestMatch(
    request: MatchRequest,
  ): Promise<
    QuickMatchResponseStatus.WAITING | QuickMatchResponseStatus.MATCHED
  > {
    const key = this.poolKey(request);
    const encoded = JSON.stringify(request);

    const tail = await this.redisService.rPop(key);
    if (tail) {
      let peer: MatchRequest;
      try {
        peer = JSON.parse(tail) as MatchRequest;
      } catch {
        this.logger.warn(`Corrupt match queue entry on ${key}; dropping`);
        await this.redisService.lPush(key, encoded);
        await this.redisService.expire(key, QUEUE_TTL_SEC);
        return QuickMatchResponseStatus.WAITING;
      }

      if (peer.userId === request.userId) {
        await this.redisService.rPush(key, tail);
        await this.redisService.lPush(key, encoded);
        await this.redisService.expire(key, QUEUE_TTL_SEC);
        return QuickMatchResponseStatus.WAITING;
      }

      this.logger.log(
        `Match found: ${peer.userId} vs ${request.userId} (${request.gameId})`,
      );
      this.eventEmitter.emit(MultiplayerGameEmitterEvent.MATCH_FOUND, {
        player1: peer,
        player2: request,
      });
      return QuickMatchResponseStatus.MATCHED;
    }

    await this.redisService.lPush(key, encoded);
    await this.redisService.expire(key, QUEUE_TTL_SEC);
    this.logger.log(
      `Player queued: ${request.userId} for ${request.gameId} (${request.betAmount} ${request.currency})`,
    );
    return QuickMatchResponseStatus.WAITING;
  }

  /**
   * Removes a user from all quick-match Redis lists for the game (best-effort scan).
   *
   * @param userId Player to dequeue.
   * @param gameId Limits scan to pools for this game type.
   */
  async cancelForUser(userId: string, gameId: DbGameSchema): Promise<void> {
    const pattern = `mp:queue:${gameId}:*`;
    const keys = await this.redisService.getAllKeys(pattern);
    for (const key of keys) {
      const len = await this.redisService.lLen(key);
      for (let i = 0; i < len; i++) {
        const raw = await this.redisService.rPop(key);
        if (!raw) break;
        try {
          const req = JSON.parse(raw) as MatchRequest;
          if (req.userId !== userId) {
            await this.redisService.lPush(key, raw);
          }
        } catch {
          /* drop corrupt */
        }
      }
    }
  }

  private poolKey(request: MatchRequest): string {
    const exact = request.betAmountMustEqual !== false;
    if (exact) {
      return `mp:queue:${request.gameId}:${request.betAmount}:${request.currency}`;
    }
    return `mp:queue:${request.gameId}:flex:${request.currency}`;
  }
}
