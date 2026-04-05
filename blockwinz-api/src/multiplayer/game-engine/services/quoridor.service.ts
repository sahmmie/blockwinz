import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DRIZZLE } from 'src/database/constants';
import type { DrizzleDb } from 'src/database/database.module';
import {
  multiplayerQuoridorGames,
  type MultiplayerQuoridorGameInsert,
  type MultiplayerQuoridorGameSelect,
  type QuoridorMoveHistoryRow,
} from 'src/database/schema/multiplayer-quoridor-games';
import type { MultiplayerQuoridorDto } from '../types/multiplayer-quoridor.types';
import type { QuoridorMove } from '@blockwinz/quoridor-engine';

@Injectable()
export class QuoridorService {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDb) {}

  private getDb(tx?: DrizzleDb): DrizzleDb {
    return tx ?? this.db;
  }

  /**
   * Inserts a new Quoridor row for a started session.
   */
  public async createGame(
    gameObj: MultiplayerQuoridorDto,
    tx?: DrizzleDb,
  ): Promise<MultiplayerQuoridorDto> {
    const db = this.getDb(tx);
    const historyRows: QuoridorMoveHistoryRow[] = (gameObj.moveHistory ?? []).map(
      (m) => ({
        userId: String(m.userId),
        move: m.move,
        timestamp: (m.timestamp instanceof Date
          ? m.timestamp
          : new Date()
        ).toISOString(),
      }),
    );
    const [row] = await db
      .insert(multiplayerQuoridorGames)
      .values({
        sessionId: String(gameObj.sessionId),
        betResultStatus: gameObj.betResultStatus,
        players: gameObj.players,
        walls: gameObj.walls,
        currentTurnUserId: gameObj.currentTurnUserId,
        winnerId: gameObj.winnerUserId ? String(gameObj.winnerUserId) : null,
        moveHistory: historyRows,
      } as MultiplayerQuoridorGameInsert)
      .returning();

    if (!row) throw new Error('Failed to create multiplayer quoridor game');
    return this.rowToDto(row);
  }

  /**
   * Persists rule updates for an existing Quoridor match row.
   */
  public async updateGame(
    gameId: string,
    gameObj: MultiplayerQuoridorDto,
    tx?: DrizzleDb,
  ): Promise<MultiplayerQuoridorDto> {
    const db = this.getDb(tx);
    const historyRows: QuoridorMoveHistoryRow[] = (gameObj.moveHistory ?? []).map(
      (m) => ({
        userId: String(m.userId),
        move: m.move,
        timestamp: (m.timestamp instanceof Date
          ? m.timestamp
          : new Date()
        ).toISOString(),
      }),
    );
    const updatePayload: Partial<MultiplayerQuoridorGameSelect> = {
      betResultStatus: gameObj.betResultStatus,
      players: gameObj.players,
      walls: gameObj.walls,
      currentTurnUserId: gameObj.currentTurnUserId,
      winnerId: gameObj.winnerUserId ? String(gameObj.winnerUserId) : null,
      moveHistory: historyRows,
      updatedAt: new Date(),
    };
    await db
      .update(multiplayerQuoridorGames)
      .set(updatePayload)
      .where(eq(multiplayerQuoridorGames.id, gameId));

    const [row] = await db
      .select()
      .from(multiplayerQuoridorGames)
      .where(eq(multiplayerQuoridorGames.id, gameId))
      .limit(1);
    if (!row) throw new Error('Quoridor game not found');
    return this.rowToDto(row);
  }

  /**
   * Fetches the Quoridor row keyed by `game_sessions.id` linkage (`session_id`).
   */
  public async getGameBySessionId(
    sessionId: string,
    tx?: DrizzleDb,
  ): Promise<MultiplayerQuoridorDto | null> {
    const db = this.getDb(tx);
    const [row] = await db
      .select()
      .from(multiplayerQuoridorGames)
      .where(eq(multiplayerQuoridorGames.sessionId, sessionId))
      .limit(1);
    return row ? this.rowToDto(row) : null;
  }

  private rowToDto(row: MultiplayerQuoridorGameSelect): MultiplayerQuoridorDto {
    const history = (row.moveHistory ?? []) as QuoridorMoveHistoryRow[];
    return {
      id: row.id,
      sessionId: String(row.sessionId ?? ''),
      boardSize: 9,
      players: row.players as MultiplayerQuoridorDto['players'],
      walls: (row.walls ?? []) as MultiplayerQuoridorDto['walls'],
      currentTurnUserId: String(row.currentTurnUserId ?? ''),
      winnerUserId: row.winnerId ? String(row.winnerId) : null,
      betResultStatus: row.betResultStatus,
      moveHistory: history.map((h) => ({
        userId: String(h.userId),
        move: h.move as QuoridorMove,
        timestamp: new Date(h.timestamp),
      })),
    };
  }
}
