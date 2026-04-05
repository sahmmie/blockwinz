import { Injectable } from '@nestjs/common';
import { DbGameSchema } from '@blockwinz/shared';
import {
  applyQuoridorMove,
  createInitialQuoridorState,
  pickAutoQuoridorMove,
  validateQuoridorMove,
  type QuoridorGameState,
  type QuoridorMove,
} from '@blockwinz/quoridor-engine';
import type { DrizzleDb } from 'src/database/database.module';
import { TicTacToeStatus } from 'src/games/tictactoe/enums/tictactoe.enums';
import { QuoridorService } from '../game-engine/services/quoridor.service';
import type { MultiplayerQuoridorDto } from '../game-engine/types/multiplayer-quoridor.types';
import type {
  MultiplayerGameOutcome,
  MultiplayerGamePlugin,
  MultiplayerMoveResult,
  MultiplayerSessionContext,
  MultiplayerTurnTimeoutPolicy,
} from './multiplayer-game-plugin.interface';
import type { MultiplayerEntryMode } from './multiplayer-entry-modes';

/** Per-turn deadline for Quoridor; override with `QUORIDOR_TURN_MS_MS` (clamped 5s–10m). */
function readQuoridorTurnMs(): number {
  const raw = process.env.QUORIDOR_TURN_MS_MS;
  if (raw === undefined || raw === '') {
    return 25_000;
  }
  const n = Number(raw);
  if (!Number.isFinite(n)) {
    return 25_000;
  }
  return Math.min(600_000, Math.max(5_000, Math.trunc(n)));
}

const QUORIDOR_TURN_MS = readQuoridorTurnMs();

function dtoToEngine(d: MultiplayerQuoridorDto): QuoridorGameState {
  return {
    boardSize: 9,
    players: d.players,
    walls: d.walls,
    currentTurnUserId: d.currentTurnUserId,
    winnerUserId: d.winnerUserId ?? undefined,
  };
}

function isQuoridorMove(m: unknown): m is QuoridorMove {
  if (!m || typeof m !== 'object') return false;
  const o = m as Record<string, unknown>;
  if (o.kind === 'pawn') {
    const to = o.to as Record<string, unknown> | undefined;
    return (
      !!to &&
      typeof to.x === 'number' &&
      typeof to.y === 'number'
    );
  }
  if (o.kind === 'wall') {
    const w = o.wall as Record<string, unknown> | undefined;
    return (
      !!w &&
      typeof w.x === 'number' &&
      typeof w.y === 'number' &&
      (w.orientation === 'horizontal' || w.orientation === 'vertical')
    );
  }
  return false;
}

/**
 * Multiplayer Quoridor rules + persistence for the shared session orchestrator.
 */
@Injectable()
export class QuoridorMultiplayerPlugin
  implements MultiplayerGamePlugin<MultiplayerQuoridorDto, QuoridorMove>
{
  readonly gameType = DbGameSchema.QuoridorGame;
  readonly minPlayers = 2;
  readonly maxPlayers = 2;
  readonly supportedEntryModes: readonly MultiplayerEntryMode[] = [
    'quick_match',
    'public_lobby',
    'private_invite',
  ];
  readonly turnPolicy: MultiplayerTurnTimeoutPolicy = {
    turnMs: QUORIDOR_TURN_MS,
    lobbyWaitMs: 600_000,
    reconnectGraceMs: 120_000,
    onTurnTimeout: 'auto_move',
  };

  constructor(private readonly quoridorService: QuoridorService) {}

  /**
   * Randomizes who starts on bottom vs top and who moves first.
   */
  async buildInitialState(
    ctx: MultiplayerSessionContext,
  ): Promise<MultiplayerQuoridorDto> {
    if (ctx.players.length !== 2) {
      throw new Error('Quoridor requires exactly two players');
    }
    const [seat0, seat1] = ctx.players.map(String);
    const bottomIsSeat1 = Math.random() < 0.5;
    const bottomUserId = bottomIsSeat1 ? seat1 : seat0;
    const topUserId = bottomIsSeat1 ? seat0 : seat1;
    const firstTurnIsBottom = Math.random() < 0.5;
    const firstTurnUserId = firstTurnIsBottom ? bottomUserId : topUserId;
    const base = createInitialQuoridorState(
      bottomUserId,
      topUserId,
      firstTurnUserId,
    );
    return {
      ...base,
      sessionId: ctx.sessionId,
      betResultStatus: TicTacToeStatus.IN_PROGRESS,
      moveHistory: [],
    };
  }

  /**
   * @returns `true` if the move is legal, otherwise a short reason string.
   */
  validateMove(
    _ctx: MultiplayerSessionContext,
    state: MultiplayerQuoridorDto,
    userId: string,
    move: QuoridorMove,
  ): true | string {
    if (state.betResultStatus !== TicTacToeStatus.IN_PROGRESS) {
      return 'Game is not in progress';
    }
    if (!isQuoridorMove(move)) {
      return 'Invalid move payload';
    }
    return validateQuoridorMove(dtoToEngine(state), String(userId), move);
  }

  /**
   * Applies a validated move and updates match status when terminal.
   */
  applyMove(
    ctx: MultiplayerSessionContext,
    state: MultiplayerQuoridorDto,
    userId: string,
    move: QuoridorMove,
  ): MultiplayerMoveResult<MultiplayerQuoridorDto> {
    const engineBefore = dtoToEngine(state);
    const result = applyQuoridorMove(engineBefore, String(userId), move);
    const history = [
      ...(state.moveHistory ?? []),
      { userId: String(userId), move, timestamp: new Date() },
    ];

    if (result.terminal && result.winnerUserId) {
      const outcome: MultiplayerGameOutcome = {
        winnerUserIds: [String(result.winnerUserId)],
        isDraw: false,
        metadata: {},
      };
      return {
        newState: {
          ...state,
          ...result.nextState,
          betResultStatus: TicTacToeStatus.WIN,
          winnerUserId: result.winnerUserId,
          moveHistory: history,
        },
        terminal: true,
        outcome,
      };
    }

    return {
      newState: {
        ...state,
        ...result.nextState,
        betResultStatus: TicTacToeStatus.IN_PROGRESS,
        moveHistory: history,
      },
      terminal: false,
    };
  }

  /**
   * Forfeiting player loses; opponent is declared winner.
   */
  applyForfeit(
    ctx: MultiplayerSessionContext,
    state: MultiplayerQuoridorDto,
    forfeitingUserId: string,
  ): MultiplayerMoveResult<MultiplayerQuoridorDto> | null {
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
    const outcome: MultiplayerGameOutcome = {
      winnerUserIds: [opponentId],
      isDraw: false,
      metadata: { reason: 'forfeit' },
    };
    return {
      newState: {
        ...state,
        betResultStatus: TicTacToeStatus.WIN,
        currentTurnUserId: opponentId,
        winnerUserId: opponentId,
        moveHistory: state.moveHistory ?? [],
      },
      terminal: true,
      outcome,
    };
  }

  /**
   * Loads persisted state for rule evaluation.
   */
  async loadStateBySessionId(
    sessionId: string,
    tx?: DrizzleDb,
  ): Promise<MultiplayerQuoridorDto | null> {
    return this.quoridorService.getGameBySessionId(sessionId, tx);
  }

  /**
   * Inserts or updates the `multiplayer_quoridor_games` row.
   */
  async persistState(
    _sessionId: string,
    state: MultiplayerQuoridorDto,
    tx?: DrizzleDb,
  ): Promise<MultiplayerQuoridorDto> {
    if (state.id) {
      return this.quoridorService.updateGame(state.id, state, tx);
    }
    return this.quoridorService.createGame(state, tx);
  }

  /**
   * Full information for both players (no hidden state).
   */
  toPublicView(
    state: MultiplayerQuoridorDto,
    viewerUserId?: string | null,
  ): unknown {
    void viewerUserId;
    return {
      boardSize: state.boardSize,
      players: state.players,
      walls: state.walls,
      currentTurn: state.currentTurnUserId,
      betResultStatus: state.betResultStatus,
      winnerId: state.winnerUserId ?? null,
    };
  }

  /**
   * Both disconnected: draw. One disconnected: no automatic result.
   */
  async resolveReconnectGraceTimeout(
    ctx: MultiplayerSessionContext,
    state: MultiplayerQuoridorDto,
    connectionSnapshots: { userId: string; connected: boolean }[],
  ): Promise<MultiplayerMoveResult<MultiplayerQuoridorDto> | null> {
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
      const terminal: MultiplayerQuoridorDto = {
        ...state,
        betResultStatus: TicTacToeStatus.TIE,
        currentTurnUserId: state.currentTurnUserId,
        winnerUserId: null,
        moveHistory: state.moveHistory ?? [],
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

    return null;
  }

  /**
   * On turn expiry: apply a deterministic legal move for the current player (same as TTT auto-move path).
   * If no legal move exists, the current player forfeits.
   */
  async resolveTurnTimeout(
    ctx: MultiplayerSessionContext,
    state: MultiplayerQuoridorDto,
  ): Promise<MultiplayerMoveResult<MultiplayerQuoridorDto> | null> {
    if (state.betResultStatus !== TicTacToeStatus.IN_PROGRESS) {
      return null;
    }
    const timedOutUserId = state.currentTurnUserId;
    if (!timedOutUserId) {
      return null;
    }
    const uid = String(timedOutUserId);
    const auto = pickAutoQuoridorMove(dtoToEngine(state), uid);
    if (auto) {
      return this.applyMove(ctx, state, uid, auto);
    }
    const winnerId = ctx.players.find((p) => String(p) !== uid);
    if (!winnerId) {
      return null;
    }
    const outcome: MultiplayerGameOutcome = {
      winnerUserIds: [String(winnerId)],
      isDraw: false,
      metadata: { reason: 'turn_timeout_no_legal_move' },
    };
    return {
      newState: {
        ...state,
        betResultStatus: TicTacToeStatus.WIN,
        currentTurnUserId: String(winnerId),
        winnerUserId: String(winnerId),
        moveHistory: state.moveHistory ?? [],
      },
      terminal: true,
      outcome,
    };
  }
}
