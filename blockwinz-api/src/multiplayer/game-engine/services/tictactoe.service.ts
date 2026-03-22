import { Inject, Injectable } from '@nestjs/common';
import { TicTacToeStatus } from 'src/games/tictactoe/enums/tictactoe.enums';
import type { MultiplayerTicTacToeDto } from '../types/multiplayer-tictactoe.types';
import { DRIZZLE } from 'src/database/constants';
import type { DrizzleDb } from 'src/database/database.module';
import { multiplayerTictactoeGames } from 'src/database/schema/multiplayer-tictactoe-games';
import { eq } from 'drizzle-orm';
import type {
  MultiplayerTictactoeGameSelect,
  MultiplayerTictactoeGameInsert,
} from 'src/database/schema/multiplayer-tictactoe-games';

@Injectable()
export class TicTacToeService {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDb) {}

  private getDb(tx?: DrizzleDb): DrizzleDb {
    return tx ?? this.db;
  }

  public async CreateGame(
    gameObj: MultiplayerTicTacToeDto,
    tx?: DrizzleDb,
  ): Promise<MultiplayerTicTacToeDto> {
    const board: Array<Array<'X' | 'O' | ''>> = [
      ['', '', ''],
      ['', '', ''],
      ['', '', ''],
    ];
    const players = gameObj.players.map((p) => ({
      playerIsNext: p.playerIsNext,
      userId: String(p.userId),
      userIs: p.userIs,
    }));
    const sessionId = String(gameObj.sessionId);

    const db = this.getDb(tx);
    const [row] = await db
      .insert(multiplayerTictactoeGames)
      .values({
        board,
        betResultStatus: gameObj.betResultStatus ?? TicTacToeStatus.NOT_STARTED,
        players,
        currentTurn: gameObj.players[0]?.userIs ?? null,
        winner: null,
        winnerId: null,
        moveHistory: [],
        sessionId,
        afkPlayers: [],
      } as MultiplayerTictactoeGameInsert)
      .returning();

    if (!row) throw new Error('Failed to create multiplayer tictactoe game');
    return this.rowToDto(row);
  }

  public async updateGame(
    gameId: string,
    gameObj: MultiplayerTicTacToeDto,
    tx?: DrizzleDb,
  ): Promise<MultiplayerTicTacToeDto> {
    const updatePayload: Partial<MultiplayerTictactoeGameSelect> = {
      board: gameObj.board as Array<Array<'X' | 'O' | ''>>,
      betResultStatus: gameObj.betResultStatus,
      players: gameObj.players.map((p) => ({
        playerIsNext: p.playerIsNext,
        userId: String(p.userId),
        userIs: p.userIs,
      })),
      currentTurn: gameObj.currentTurn,
      winner: gameObj.winner,
      winnerId: gameObj.winnerId ? String(gameObj.winnerId) : null,
      moveHistory: (gameObj.moveHistory ?? []).map((m) => ({
        userId: String(m.userId),
        row: m.row,
        col: m.col,
        timestamp: (m.timestamp instanceof Date
          ? m.timestamp
          : new Date()
        ).toISOString(),
      })),
      afkPlayers: (gameObj.afkPlayers ?? []).map((id) => String(id)),
      updatedAt: new Date(),
    };

    const db = this.getDb(tx);
    await db
      .update(multiplayerTictactoeGames)
      .set(updatePayload)
      .where(eq(multiplayerTictactoeGames.id, gameId));

    const [row] = await db
      .select()
      .from(multiplayerTictactoeGames)
      .where(eq(multiplayerTictactoeGames.id, gameId))
      .limit(1);
    if (!row) throw new Error('Game not found');
    return this.rowToDto(row);
  }

  public async GetGame(
    gameId: string,
  ): Promise<MultiplayerTicTacToeDto | null> {
    const [row] = await this.db
      .select()
      .from(multiplayerTictactoeGames)
      .where(eq(multiplayerTictactoeGames.id, gameId))
      .limit(1);
    return row ? this.rowToDto(row) : null;
  }

  public async GetActiveGameForUser(
    userId: string,
  ): Promise<MultiplayerTicTacToeDto | null> {
    const rows = await this.db
      .select()
      .from(multiplayerTictactoeGames)
      .where(
        eq(
          multiplayerTictactoeGames.betResultStatus,
          TicTacToeStatus.IN_PROGRESS,
        ),
      );
    const row = rows.find((r) =>
      ((r.players as Array<{ userId: string }>) ?? []).some(
        (p) => p.userId === userId,
      ),
    );
    return row ? this.rowToDto(row) : null;
  }

  public async GetGameBySessionId(
    sessionId: string,
    tx?: DrizzleDb,
  ): Promise<MultiplayerTicTacToeDto | null> {
    const db = this.getDb(tx);
    const [row] = await db
      .select()
      .from(multiplayerTictactoeGames)
      .where(eq(multiplayerTictactoeGames.sessionId, sessionId))
      .limit(1);
    return row ? this.rowToDto(row) : null;
  }

  public async getGamesByStatus(
    status: TicTacToeStatus,
  ): Promise<MultiplayerTicTacToeDto[]> {
    const rows = await this.db
      .select()
      .from(multiplayerTictactoeGames)
      .where(eq(multiplayerTictactoeGames.betResultStatus, status));
    return rows.map((r) => this.rowToDto(r));
  }

  private rowToDto(
    row: MultiplayerTictactoeGameSelect,
  ): MultiplayerTicTacToeDto {
    const players = (row.players ?? []) as Array<{
      playerIsNext?: boolean;
      userId: string;
      userIs: string;
    }>;
    const moveHistory = (row.moveHistory ?? []) as Array<{
      userId: string;
      row: number;
      col: number;
      timestamp: string;
    }>;
    return {
      id: row.id,
      board: (row.board ?? []) as Array<Array<'X' | 'O' | ''>>,
      betResultStatus: row.betResultStatus as TicTacToeStatus,
      players: players.map((p) => ({
        playerIsNext: p.playerIsNext,
        userId: p.userId,
        userIs: p.userIs,
      })),
      currentTurn: row.currentTurn as 'X' | 'O' | null,
      winner: row.winner as 'X' | 'O' | null,
      winnerId: row.winnerId,
      moveHistory: moveHistory.map((m) => ({
        userId: m.userId,
        row: m.row,
        col: m.col,
        timestamp: new Date(m.timestamp),
      })),
      sessionId: row.sessionId ?? '',
      afkPlayers: (row.afkPlayers ?? []).map(String),
    };
  }
}
