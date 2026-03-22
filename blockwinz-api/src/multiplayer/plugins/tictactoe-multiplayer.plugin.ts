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
  readonly turnPolicy = {
    turnMs: 60_000,
    lobbyWaitMs: 600_000,
    reconnectGraceMs: 120_000,
    onTurnTimeout: 'forfeit' as const,
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
}
