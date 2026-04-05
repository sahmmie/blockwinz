import type {
  QuoridorGameState,
  QuoridorMove,
  QuoridorWall,
} from '@blockwinz/quoridor-engine';

/**
 * Persisted multiplayer Quoridor row + session linkage (mirrors `multiplayer_quoridor_games`).
 */
export type MultiplayerQuoridorDto = QuoridorGameState & {
  /** Drizzle row id when loaded from DB. */
  id?: string;
  sessionId: string;
  betResultStatus: string;
  moveHistory: Array<{
    userId: string;
    move: QuoridorMove;
    timestamp: Date;
  }>;
};

export type { QuoridorMove, QuoridorWall, QuoridorGameState };
