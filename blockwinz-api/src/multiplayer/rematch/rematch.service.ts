import { Injectable, Logger } from '@nestjs/common';
import { DbGameSchema } from '@blockwinz/shared';
import { RedisService } from 'src/shared/services/redis.service';
import { UserDto } from 'src/shared/dtos/user.dto';
import { getUserId } from 'src/shared/helpers/user.helper';
import { WsExceptionWithCode } from 'src/shared/filters/ws-exception-with-code';
import {
  GameSessionDocument,
  GameSessionService,
} from '../game-session/game-session.service';
import { MultiplayerSessionStatus } from '../game-session/interfaces/game-session.interface';

const REMATCH_INTENT_TTL_SEC = 900;

/**
 * Atomically SADD user, EXPIRE, and if cardinality ≥ 2 return MATCH:id|id and DEL; else WAIT if newly added; else NOOP.
 */
const REMATCH_ADD_SCRIPT = `
local added = redis.call('SADD', KEYS[1], ARGV[1])
redis.call('EXPIRE', KEYS[1], tonumber(ARGV[2]))
local c = redis.call('SCARD', KEYS[1])
if c >= 2 then
  local m = redis.call('SMEMBERS', KEYS[1])
  redis.call('DEL', KEYS[1])
  return 'MATCH:' .. table.concat(m, '|')
end
if added == 1 then
  return 'WAIT'
end
return 'NOOP'
`;

/**
 * Coordinates post-game rematch intents in Redis and creates a new matched session when both players commit.
 */
@Injectable()
export class RematchService {
  private readonly logger = new Logger(RematchService.name);

  constructor(
    private readonly redisService: RedisService,
    private readonly gameSessionService: GameSessionService,
  ) {}

  private intentKey(completedSessionId: string): string {
    return `mp:rematch:intent:${completedSessionId}`;
  }

  /**
   * Loads a completed two-player session and ensures the user is a participant (rematch eligibility).
   *
   * @param completedSessionId Finished session row id.
   * @param user Authenticated user.
   * @returns Session document, both player ids, and the peer id for the caller.
   * @throws WsExceptionWithCode when not found, wrong status, or wrong player count.
   */
  private async assertCompletedTwoPlayerSession(
    completedSessionId: string,
    user: UserDto,
  ): Promise<{
    doc: GameSessionDocument;
    players: string[];
    peerUserId: string;
  }> {
    const doc =
      await this.gameSessionService.getSessionById(completedSessionId);
    if (!doc) {
      throw new WsExceptionWithCode('Session not found', 404);
    }
    if (doc.gameStatus !== MultiplayerSessionStatus.COMPLETED) {
      throw new WsExceptionWithCode(
        'Rematch is only available after the match has finished',
        400,
      );
    }
    const players = (doc.players ?? []).map(String);
    if (players.length !== 2) {
      throw new WsExceptionWithCode(
        'Rematch is only supported for two-player sessions',
        400,
      );
    }
    const userId = getUserId(user);
    if (!players.includes(userId)) {
      throw new WsExceptionWithCode('Not a player in this session', 403);
    }
    const peerUserId = players.find((p) => p !== userId)!;
    return { doc, players, peerUserId };
  }

  /**
   * Ensures neither participant already has a pending or in-progress table for this game type.
   *
   * @param players Both user ids.
   * @param gameType Game discriminator.
   * @throws WsExceptionWithCode when either player is already seated elsewhere.
   */
  private async assertNeitherHasActiveSession(
    players: string[],
    gameType: DbGameSchema,
  ): Promise<void> {
    for (const pid of players) {
      const active = await this.gameSessionService.getActiveGame(
        { _id: pid } as UserDto,
        gameType,
      );
      if (active) {
        throw new WsExceptionWithCode(
          'A player already has an active multiplayer session',
          400,
        );
      }
    }
  }

  /** Parses pipe-separated user ids from the Lua `MATCH:` branch. */
  private parseMatchMembers(payload: string): string[] {
    const rest = payload.slice('MATCH:'.length);
    return rest.split('|').filter(Boolean);
  }

  /**
   * Registers rematch intent or completes rematch when the second player commits.
   *
   * @param user Caller.
   * @param completedSessionId Session that just finished (`COMPLETED`).
   * @returns Whether to notify the peer (`waiting`), no further action (`noop`), or new session (`matched`).
   */
  async addRematchIntent(
    user: UserDto,
    completedSessionId: string,
  ): Promise<
    | { kind: 'noop' }
    | { kind: 'waiting'; peerUserId: string; completedSessionId: string }
    | {
        kind: 'matched';
        session: GameSessionDocument;
        playerIds: string[];
        completedSessionId: string;
      }
  > {
    const { doc, players, peerUserId } =
      await this.assertCompletedTwoPlayerSession(completedSessionId, user);
    const gameType = doc.gameType as DbGameSchema;
    await this.assertNeitherHasActiveSession(players, gameType);

    const userId = getUserId(user);
    const key = this.intentKey(completedSessionId);
    const raw = await this.redisService.evalScript(
      REMATCH_ADD_SCRIPT,
      1,
      [key],
      [userId, String(REMATCH_INTENT_TTL_SEC)],
    );
    const tag = typeof raw === 'string' ? raw : String(raw ?? '');

    if (tag.startsWith('MATCH:')) {
      const ids = this.parseMatchMembers(tag);
      if (ids.length !== 2) {
        this.logger.warn(
          `Rematch MATCH branch had unexpected members for ${completedSessionId}`,
        );
        throw new WsExceptionWithCode('Rematch sync failed; try again', 500);
      }
      const setIds = new Set(ids);
      if (!players.every((p) => setIds.has(p))) {
        throw new WsExceptionWithCode('Rematch participants mismatch', 400);
      }

      const hostId = String(doc.hostUserId ?? doc.userId);
      const guestId = players.find((p) => p !== hostId)!;
      const session = await this.gameSessionService.createMatchedSession({
        playerOneId: hostId,
        playerTwoId: guestId,
        gameType,
        betAmount: Number(doc.betAmount),
        currency: doc.currency,
        visibility: doc.visibility === 'private' ? 'private' : 'public',
      });
      return {
        kind: 'matched',
        session,
        playerIds: players,
        completedSessionId,
      };
    }

    if (tag === 'WAIT') {
      return {
        kind: 'waiting',
        peerUserId,
        completedSessionId,
      };
    }

    return { kind: 'noop' };
  }

  /**
   * Clears all rematch intents for the session and returns former requester ids to notify.
   *
   * @param user Typically the invitee declining.
   * @param completedSessionId Completed session id.
   * @returns User ids that held an intent and should receive `rematch.declined`.
   */
  async declineRematch(
    user: UserDto,
    completedSessionId: string,
  ): Promise<{ notifyUserIds: string[] }> {
    await this.assertCompletedTwoPlayerSession(completedSessionId, user);
    const key = this.intentKey(completedSessionId);
    const members = await this.redisService.sMembers(key);
    if (members.length === 0) {
      return { notifyUserIds: [] };
    }
    await this.redisService.delKey(key);
    return { notifyUserIds: [...members] };
  }

  /**
   * Removes the caller from the rematch intent set and returns the peer to notify when the table is cleared.
   *
   * @param user Caller withdrawing intent.
   * @param completedSessionId Completed session id.
   */
  async cancelRematch(
    user: UserDto,
    completedSessionId: string,
  ): Promise<{ notifyPeerUserId: string | null }> {
    const { peerUserId } = await this.assertCompletedTwoPlayerSession(
      completedSessionId,
      user,
    );
    const userId = getUserId(user);
    const key = this.intentKey(completedSessionId);
    const removed = await this.redisService.sRem(key, userId);
    if (removed === 0) {
      return { notifyPeerUserId: null };
    }
    const card = await this.redisService.sCard(key);
    if (card === 0) {
      await this.redisService.delKey(key);
    }
    return { notifyPeerUserId: peerUserId };
  }
}
