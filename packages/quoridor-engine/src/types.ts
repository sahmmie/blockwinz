/** Standard Quoridor board is 9×9 cells (indices 0–8). */
export const QUORIDOR_BOARD_SIZE = 9 as const;

export type QuoridorBoardSize = typeof QUORIDOR_BOARD_SIZE;

export interface QuoridorPosition {
  x: number;
  y: number;
}

export interface QuoridorPlayerState {
  userId: string;
  position: QuoridorPosition;
  wallsRemaining: number;
}

export type WallOrientation = 'horizontal' | 'vertical';

/**
 * Canonical wall coordinates (matches `buildBlockMap`):
 * - **horizontal** at `(x, y)`: spans the edge between row `y` and `y + 1`, covering columns `x` and `x + 1`. Valid `x ∈ [0,7]`, `y ∈ [0,7]`.
 * - **vertical** at `(x, y)`: spans the edge between column `x` and `x + 1`, covering rows `y` and `y + 1`. Valid `x ∈ [0,7]`, `y ∈ [0,7]`.
 */
export interface QuoridorWall {
  x: number;
  y: number;
  orientation: WallOrientation;
}

export type QuoridorMove =
  | { kind: 'pawn'; to: QuoridorPosition }
  | { kind: 'wall'; wall: QuoridorWall };

export interface QuoridorGameState {
  boardSize: QuoridorBoardSize;
  /** Index 0: starts row 0, goal row 8. Index 1: starts row 8, goal row 0. */
  players: [QuoridorPlayerState, QuoridorPlayerState];
  walls: QuoridorWall[];
  currentTurnUserId: string;
  winnerUserId?: string;
}

/**
 * Per-cell movement flags: `map.up[y][x]` means “moving up from `(x,y)` is blocked”.
 */
export interface QuoridorBlockMap {
  up: boolean[][];
  down: boolean[][];
  left: boolean[][];
  right: boolean[][];
}
