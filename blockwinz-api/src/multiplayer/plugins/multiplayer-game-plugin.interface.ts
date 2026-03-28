import type { DbGameSchema } from '@blockwinz/shared';
import type { DrizzleDb } from 'src/database/database.module';
import type { MultiplayerEntryMode } from './multiplayer-entry-modes';

/**
 * Declarative timeout / AFK behaviour for a game type (enforced by the orchestrator).
 */
export interface MultiplayerTurnTimeoutPolicy {
  /** Max ms for a single turn while the game is in progress. */
  turnMs: number;
  /** Max ms waiting in lobby before host auto-cancel (optional future use). */
  lobbyWaitMs: number;
  /** After disconnect, how long the player can reconnect before forfeit. */
  reconnectGraceMs: number;
  /** When turn timer fires: forfeit the inactive player or apply an automated move. */
  onTurnTimeout: 'forfeit' | 'auto_move';
}

/**
 * Normalized outcome after a terminal position (no wallet side effects).
 */
export interface MultiplayerGameOutcome {
  winnerUserIds: string[];
  isDraw: boolean;
  metadata: Record<string, unknown>;
}

export interface MultiplayerMoveResult<TState = unknown> {
  newState: TState;
  terminal: boolean;
  outcome?: MultiplayerGameOutcome;
}

/** Per-player connection snapshot for reconnect-grace resolution (game-agnostic). */
export interface PlayerConnectionSnapshot {
  userId: string;
  connected: boolean;
}

/**
 * Session slice the orchestrator passes into rule evaluation (DB-agnostic).
 */
export interface MultiplayerSessionContext {
  sessionId: string;
  gameType: DbGameSchema;
  players: string[];
  betAmount: number;
  currency: string;
}

/**
 * Contract each multiplayer title implements. Keeps gateway/session code game-agnostic.
 */
export interface MultiplayerGamePlugin<TState = unknown, TMove = unknown> {
  readonly gameType: DbGameSchema;
  readonly minPlayers: number;
  readonly maxPlayers: number;
  readonly supportedEntryModes: readonly MultiplayerEntryMode[];
  readonly turnPolicy: MultiplayerTurnTimeoutPolicy;

  /**
   * Builds persisted initial state when the table row is first created (enough players seated).
   */
  buildInitialState(ctx: MultiplayerSessionContext): Promise<TState>;

  /**
   * @returns true if valid, or an error message string.
   */
  validateMove(
    ctx: MultiplayerSessionContext,
    state: TState,
    userId: string,
    move: TMove,
  ): true | string;

  applyMove(
    ctx: MultiplayerSessionContext,
    state: TState,
    userId: string,
    move: TMove,
  ): MultiplayerMoveResult<TState>;

  /**
   * Voluntary forfeit: forfeiting player loses; opponent wins the match.
   * @returns null if forfeit is not allowed (e.g. game not in progress).
   */
  applyForfeit(
    ctx: MultiplayerSessionContext,
    state: TState,
    forfeitingUserId: string,
  ): MultiplayerMoveResult<TState> | null;

  loadStateBySessionId(
    sessionId: string,
    tx?: DrizzleDb,
  ): Promise<TState | null>;

  persistState(
    sessionId: string,
    state: TState,
    tx?: DrizzleDb,
  ): Promise<TState>;

  /**
   * Strip hidden information for spectators (e.g. fog of war). Default impl may return state as-is.
   */
  /** Optional second argument reserved for spectator-safe views in future games. */
  toPublicView(state: TState, viewerUserId?: string | null): unknown;

  /**
   * When `reconnect_grace_until` has passed: resolve draw / forfeit / or return null if both players are back online.
   */
  resolveReconnectGraceTimeout(
    ctx: MultiplayerSessionContext,
    state: TState,
    connectionSnapshots: PlayerConnectionSnapshot[],
  ): Promise<MultiplayerMoveResult<TState> | null>;

  /**
   * When `turn_deadline_at` has passed: forfeit current player, auto-move, or return null if nothing to do.
   */
  resolveTurnTimeout(
    ctx: MultiplayerSessionContext,
    state: TState,
  ): Promise<MultiplayerMoveResult<TState> | null>;
}
