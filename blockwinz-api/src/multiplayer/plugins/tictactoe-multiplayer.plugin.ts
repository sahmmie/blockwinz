import { Injectable } from '@nestjs/common';
import { DbGameSchema } from '@blockwinz/shared';
import type { MultiplayerTicTacToeDto } from '../game-engine/types/multiplayer-tictactoe.types';
import { TicTacToeService } from '../game-engine/services/tictactoe.service';
import {
  TicTacToeStatus,
  XOTurn,
} from 'src/games/tictactoe/enums/tictactoe.enums';
import type { DrizzleDb } from 'src/database/database.module';
import type {
  MultiplayerGameOutcome,
  MultiplayerGamePlugin,
  MultiplayerMoveResult,
  MultiplayerSessionContext,
} from './multiplayer-game-plugin.interface';
import type { MultiplayerEntryMode } from './multiplayer-entry-modes';
import type { MultiplayerTurnTimeoutPolicy } from './multiplayer-game-plugin.interface';

export type TicTacToeMultiplayerMove = { row: number; col: number };

function emptyBoard(): Array<Array<'X' | 'O' | ''>> {
  return [
    ['', '', ''],
    ['', '', ''],
    ['', '', ''],
  ];
}

function cloneBoard(
  board: Array<Array<'X' | 'O' | ''>>,
): Array<Array<'X' | 'O' | ''>> {
  return board.map((r) => [...r]);
}

function lineWinner(
  board: Array<Array<'X' | 'O' | ''>>,
): 'X' | 'O' | null {
  const lines: Array<Array<'X' | 'O' | ''>> = [
    ...board,
    [board[0][0], board[1][0], board[2][0]],
    [board[0][1], board[1][1], board[2][1]],
    [board[0][2], board[1][2], board[2][2]],
    [board[0][0], board[1][1], board[2][2]],
    [board[0][2], board[1][1], board[2][0]],
  ];
  for (const line of lines) {
    const [a, b, c] = line;
    if (a && a === b && b === c) {
      return a as 'X' | 'O';
    }
  }
  return null;
}

function boardFull(board: Array<Array<'X' | 'O' | ''>>): boolean {
  return board.every((row) => row.every((c) => c !== ''));
}

function userIdForSymbol(
  players: MultiplayerTicTacToeDto['players'],
  sym: 'X' | 'O',
): string | null {
  const p = players.find((x) => x.userIs === sym);
  return p ? String(p.userId) : null;
}

/**
 * Multiplayer Tic Tac Toe rules + persistence adapter for the shared orchestrator.
 */
@Injectable()
export class TicTacToeMultiplayerPlugin
  implements
    MultiplayerGamePlugin<MultiplayerTicTacToeDto, TicTacToeMultiplayerMove>
{
  readonly gameType = DbGameSchema.TicTacToeGame;
  readonly minPlayers = 2;
  readonly maxPlayers = 2;
  readonly supportedEntryModes: readonly MultiplayerEntryMode[] = [
    'quick_match',
    'public_lobby',
    'private_invite',
  ];
  readonly turnPolicy: MultiplayerTurnTimeoutPolicy = {
    /** Long clock so casual play is not decided by a short think timer; overrun uses auto-move, not forfeit. */
    turnMs: 600_000,
    lobbyWaitMs: 600_000,
    reconnectGraceMs: 120_000,
    /** Never award a win on turn expiry — play the forced move so the match continues until board outcome or both leave. */
    onTurnTimeout: 'auto_move',
  };

  constructor(private readonly ticTacToeService: TicTacToeService) {}

  /**
   * Randomly assigns X/O between the two seated players.
   */
  async buildInitialState(
    ctx: MultiplayerSessionContext,
  ): Promise<MultiplayerTicTacToeDto> {
    if (ctx.players.length !== 2) {
      throw new Error('Tic Tac Toe requires exactly two players');
    }
    const [a, b] = ctx.players;
    const swap = Math.random() < 0.5;
    const firstUserId = swap ? b : a;
    const secondUserId = swap ? a : b;
    return {
      sessionId: ctx.sessionId,
      board: emptyBoard(),
      betResultStatus: TicTacToeStatus.IN_PROGRESS,
      players: [
        {
          userId: firstUserId,
          userIs: XOTurn.X,
          playerIsNext: true,
        },
        {
          userId: secondUserId,
          userIs: XOTurn.O,
          playerIsNext: false,
        },
      ],
      currentTurn: XOTurn.X,
      winner: null,
      winnerId: null,
      moveHistory: [],
      afkPlayers: [],
    };
  }

  validateMove(
    ctx: MultiplayerSessionContext,
    state: MultiplayerTicTacToeDto,
    userId: string,
    move: TicTacToeMultiplayerMove,
  ): true | string {
    if (state.betResultStatus !== TicTacToeStatus.IN_PROGRESS) {
      return 'Game is not in progress';
    }
    const me = state.players.find((p) => p.userId === userId);
    if (!me) {
      return 'You are not a player in this game';
    }
    if (state.currentTurn !== me.userIs) {
      return 'It is not your turn';
    }
    const { row, col } = move;
    if (row < 0 || row > 2 || col < 0 || col > 2) {
      return 'Invalid cell';
    }
    if (state.board[row][col] !== '') {
      return 'Cell already taken';
    }
    return true;
  }

  applyForfeit(
    ctx: MultiplayerSessionContext,
    state: MultiplayerTicTacToeDto,
    forfeitingUserId: string,
  ): MultiplayerMoveResult<MultiplayerTicTacToeDto> | null {
    if (state.betResultStatus !== TicTacToeStatus.IN_PROGRESS) {
      return null;
    }
    const fid = String(forfeitingUserId);
    const playerIds = ctx.players.map((p) => String(p));
    if (!playerIds.includes(fid)) {
      return null;
    }
    const opponentId = playerIds.find((p) => p !== fid);
    if (!opponentId) {
      return null;
    }
    const winnerPlayer = state.players.find(
      (p) => String(p.userId) === opponentId,
    );
    const winnerSym = (winnerPlayer?.userIs as 'X' | 'O' | null) ?? null;
    const outcome: MultiplayerGameOutcome = {
      winnerUserIds: [opponentId],
      isDraw: false,
      metadata: { reason: 'forfeit' },
    };
    const terminal: MultiplayerTicTacToeDto = {
      ...state,
      betResultStatus: TicTacToeStatus.WIN,
      currentTurn: null,
      winner: winnerSym,
      winnerId: opponentId,
      players: state.players.map((p) => ({
        ...p,
        playerIsNext: false,
      })),
    };
    return {
      newState: terminal,
      terminal: true,
      outcome,
    };
  }

  applyMove(
    _ctx: MultiplayerSessionContext,
    state: MultiplayerTicTacToeDto,
    userId: string,
    move: TicTacToeMultiplayerMove,
  ): MultiplayerMoveResult<MultiplayerTicTacToeDto> {
    const board = cloneBoard(state.board);
    const me = state.players.find((p) => p.userId === userId)!;
    board[move.row][move.col] = me.userIs as 'X' | 'O';

    const winSym = lineWinner(board);
    const history = [
      ...(state.moveHistory ?? []),
      {
        userId,
        row: move.row,
        col: move.col,
        timestamp: new Date(),
      },
    ];

    if (winSym) {
      const winnerId = userIdForSymbol(state.players, winSym);
      const outcome: MultiplayerGameOutcome = {
        winnerUserIds: winnerId ? [winnerId] : [],
        isDraw: false,
        metadata: { symbol: winSym },
      };
      return {
        newState: {
          ...state,
          board,
          betResultStatus: TicTacToeStatus.WIN,
          currentTurn: null,
          winner: winSym,
          winnerId,
          moveHistory: history,
          players: state.players.map((p) => ({
            ...p,
            playerIsNext: false,
          })),
        },
        terminal: true,
        outcome,
      };
    }

    if (boardFull(board)) {
      const outcome: MultiplayerGameOutcome = {
        winnerUserIds: [],
        isDraw: true,
        metadata: {},
      };
      return {
        newState: {
          ...state,
          board,
          betResultStatus: TicTacToeStatus.TIE,
          currentTurn: null,
          winner: null,
          winnerId: null,
          moveHistory: history,
          players: state.players.map((p) => ({
            ...p,
            playerIsNext: false,
          })),
        },
        terminal: true,
        outcome,
      };
    }

    const nextTurn = me.userIs === XOTurn.X ? XOTurn.O : XOTurn.X;
    return {
      newState: {
        ...state,
        board,
        currentTurn: nextTurn,
        moveHistory: history,
        players: state.players.map((p) => ({
          ...p,
          playerIsNext: p.userIs === nextTurn,
        })),
      },
      terminal: false,
    };
  }

  async loadStateBySessionId(
    sessionId: string,
    tx?: DrizzleDb,
  ): Promise<MultiplayerTicTacToeDto | null> {
    return this.ticTacToeService.GetGameBySessionId(sessionId, tx);
  }

  /**
   * Inserts a new row when `state.id` is missing; otherwise updates by row id.
   */
  async persistState(
    _sessionId: string,
    state: MultiplayerTicTacToeDto,
    tx?: DrizzleDb,
  ): Promise<MultiplayerTicTacToeDto> {
    if (state.id) {
      return this.ticTacToeService.updateGame(state.id, state, tx);
    }
    return this.ticTacToeService.CreateGame(state, tx);
  }

  toPublicView(state: MultiplayerTicTacToeDto, viewerUserId?: string | null): unknown {
    void viewerUserId;
    return state;
  }

  async resolveReconnectGraceTimeout(
    ctx: MultiplayerSessionContext,
    state: MultiplayerTicTacToeDto,
    connectionSnapshots: {
      userId: string;
      connected: boolean;
    }[],
  ): Promise<MultiplayerMoveResult<MultiplayerTicTacToeDto> | null> {
    if (ctx.players.length !== 2) {
      return null;
    }
    const [p1, p2] = ctx.players;
    const s1 = connectionSnapshots.find((s) => s.userId === p1);
    const s2 = connectionSnapshots.find((s) => s.userId === p2);
    const disc1 = !!s1 && !s1.connected;
    const disc2 = !!s2 && !s2.connected;

    if (!disc1 && !disc2) {
      return null;
    }

    if (disc1 && disc2) {
      const terminal: MultiplayerTicTacToeDto = {
        ...state,
        betResultStatus: TicTacToeStatus.TIE,
        currentTurn: null,
        winner: null,
        winnerId: null,
        players: state.players.map((p) => ({
          ...p,
          playerIsNext: false,
        })),
      };
      return {
        newState: terminal,
        terminal: true,
        outcome: {
          winnerUserIds: [],
          isDraw: true,
          metadata: { reason: 'disconnect_both' },
        },
      };
    }

    /** One socket offline: do not declare a winner — the other player may still be connected. */
    return null;
  }

  async resolveTurnTimeout(
    ctx: MultiplayerSessionContext,
    state: MultiplayerTicTacToeDto,
  ): Promise<MultiplayerMoveResult<MultiplayerTicTacToeDto> | null> {
    if (state.betResultStatus !== TicTacToeStatus.IN_PROGRESS) {
      return null;
    }

    if (this.turnPolicy.onTurnTimeout === 'auto_move') {
      const { row, col, userId } = this.findFirstAutoMove(state);
      if (row === null || col === null || !userId) {
        return null;
      }
      return this.applyMove(ctx, state, userId, { row, col });
    }

    const forfeit = this.forfeitOutcomeFromTimedOutPlayer(ctx.players, state);
    if (!forfeit) {
      return null;
    }
    const winnerId = forfeit.winnerUserIds[0] ?? null;
    const winnerPlayer = state.players.find((p) => p.userId === winnerId);
    const winnerSym = (winnerPlayer?.userIs as 'X' | 'O') ?? null;
    const terminal: MultiplayerTicTacToeDto = {
      ...state,
      betResultStatus: TicTacToeStatus.WIN,
      currentTurn: null,
      winner: winnerSym,
      winnerId,
      players: state.players.map((p) => ({
        ...p,
        playerIsNext: false,
      })),
    };
    return {
      newState: terminal,
      terminal: true,
      outcome: forfeit,
    };
  }

  private forfeitOutcomeFromTimedOutPlayer(
    players: string[],
    state: MultiplayerTicTacToeDto,
  ): MultiplayerGameOutcome | null {
    const sym = state.currentTurn as 'X' | 'O' | undefined;
    if (!sym || !state.players) {
      return null;
    }
    const timedOut = state.players.find((p) => p.userIs === sym);
    if (!timedOut) {
      return null;
    }
    const winnerId = players.find((p) => p !== timedOut.userId);
    if (!winnerId) {
      return null;
    }
    return {
      winnerUserIds: [winnerId],
      isDraw: false,
      metadata: { reason: 'turn_timeout' },
    };
  }

  private findFirstAutoMove(state: MultiplayerTicTacToeDto): {
    row: number | null;
    col: number | null;
    userId: string | null;
  } {
    const board = state.board;
    const sym = state.currentTurn as 'X' | 'O' | undefined;
    if (!sym) {
      return { row: null, col: null, userId: null };
    }
    const me = state.players.find((p) => p.userIs === sym);
    const userId = me ? String(me.userId) : null;
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        if (board[r][c] === '') {
          return { row: r, col: c, userId };
        }
      }
    }
    return { row: null, col: null, userId: null };
  }
}
