import { Injectable, Logger } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { eq } from 'drizzle-orm';
import { DRIZZLE } from 'src/database/constants';
import type { DrizzleDb } from 'src/database/database.module';
import { gameSessions } from 'src/database/schema/game-sessions';
import { Inject } from '@nestjs/common';
import { MultiplayerSessionStatus } from '../interfaces/game-session.interface';
import { GameSessionService } from '../game-session.service';
import { MultiplayerSessionOrchestrator } from '../../orchestrator/multiplayer-session-orchestrator.service';
import { DbGameSchema } from '@blockwinz/shared';

const DEFAULT_LOBBY_WAIT_MS = 600_000;

/**
 * Cancels stale `pending` lobbies using each plugin's `lobbyWaitMs` (or env default).
 */
@Injectable()
export class LobbyExpiryListener {
  private readonly logger = new Logger(LobbyExpiryListener.name);

  constructor(
    @Inject(DRIZZLE) private readonly db: DrizzleDb,
    private readonly gameSessionService: GameSessionService,
    private readonly orchestrator: MultiplayerSessionOrchestrator,
  ) {}

  @Interval(60_000)
  async expireStaleLobbies(): Promise<void> {
    const rows = await this.db
      .select()
      .from(gameSessions)
      .where(eq(gameSessions.gameStatus, MultiplayerSessionStatus.PENDING));

    const now = Date.now();
    const envDefault = Number(
      process.env.MULTIPLAYER_LOBBY_MAX_WAIT_MS ?? DEFAULT_LOBBY_WAIT_MS,
    );

    for (const row of rows) {
      const plugin = this.orchestrator.getPluginOrNull(
        row.gameType as DbGameSchema,
      );
      const waitMs = plugin?.turnPolicy.lobbyWaitMs ?? envDefault;
      const created = row.createdAt?.getTime() ?? 0;
      if (now - created <= waitMs) {
        continue;
      }
      try {
        await this.gameSessionService.cancelPendingLobby(row.id);
        this.logger.log(`Expired pending lobby ${row.id} (${row.gameType})`);
      } catch (e) {
        this.logger.error(`Lobby expiry failed for ${row.id}`, e);
      }
    }
  }
}
