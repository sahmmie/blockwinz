import { buildBlockMap, wallsConflict } from './block-map.js';
import { getValidPawnMoves } from './pawn-moves.js';
import { hasPathToGoal } from './pathfinding.js';
import type {
  QuoridorGameState,
  QuoridorMove,
  QuoridorPlayerState,
  QuoridorPosition,
  QuoridorWall,
} from './types.js';
import { QUORIDOR_BOARD_SIZE } from './types.js';

const WALLS_PER_PLAYER = 10;
const MAX_COORD = 7; // walls span two units; origin 0–7 inclusive

/**
 * New game: player `bottomUserId` starts at bottom center (goal: top row),
 * `topUserId` at top center (goal: bottom row).
 */
export function createInitialQuoridorState(
  bottomUserId: string,
  topUserId: string,
  currentTurnUserId: string,
): QuoridorGameState {
  const center = Math.floor(QUORIDOR_BOARD_SIZE / 2);
  const p0: QuoridorPlayerState = {
    userId: bottomUserId,
    position: { x: center, y: 0 },
    wallsRemaining: WALLS_PER_PLAYER,
  };
  const p1: QuoridorPlayerState = {
    userId: topUserId,
    position: { x: center, y: QUORIDOR_BOARD_SIZE - 1 },
    wallsRemaining: WALLS_PER_PLAYER,
  };
  return {
    boardSize: QUORIDOR_BOARD_SIZE,
    players: [p0, p1],
    walls: [],
    currentTurnUserId,
  };
}

function playerIndexByUserId(
  state: QuoridorGameState,
  userId: string,
): 0 | 1 | -1 {
  if (state.players[0]!.userId === userId) return 0;
  if (state.players[1]!.userId === userId) return 1;
  return -1;
}

function goalRowForPlayer(index: 0 | 1): number {
  return index === 0 ? QUORIDOR_BOARD_SIZE - 1 : 0;
}

function opponentIndex(index: 0 | 1): 0 | 1 {
  return index === 0 ? 1 : 0;
}

function inBoard(p: QuoridorPosition): boolean {
  return (
    p.x >= 0 &&
    p.x < QUORIDOR_BOARD_SIZE &&
    p.y >= 0 &&
    p.y < QUORIDOR_BOARD_SIZE
  );
}

function wallInBounds(wall: QuoridorWall): boolean {
  if (wall.x < 0 || wall.y < 0 || wall.x > MAX_COORD || wall.y > MAX_COORD) {
    return false;
  }
  if (wall.orientation !== 'horizontal' && wall.orientation !== 'vertical') {
    return false;
  }
  return true;
}

/**
 * After adding `candidate`, both players must still reach their goal rows (pawns ignored).
 */
export function wallPreservesConnectivity(
  state: QuoridorGameState,
  candidate: QuoridorWall,
): boolean {
  const nextWalls = [...state.walls, candidate];
  const map = buildBlockMap(nextWalls);
  const [p0, p1] = state.players;
  const ok0 = hasPathToGoal(p0!.position, goalRowForPlayer(0), map);
  const ok1 = hasPathToGoal(p1!.position, goalRowForPlayer(1), map);
  return ok0 && ok1;
}

/**
 * @returns `true` if valid, otherwise a short reason for the client.
 */
export function validateQuoridorMove(
  state: QuoridorGameState,
  userId: string,
  move: QuoridorMove,
): true | string {
  if (state.winnerUserId) {
    return 'Game already finished';
  }

  const idxRaw = playerIndexByUserId(state, userId);
  if (idxRaw < 0) {
    return 'Not a player in this session';
  }
  const idx = idxRaw as 0 | 1;
  if (state.currentTurnUserId !== userId) {
    return 'Not your turn';
  }

  const self = state.players[idx]!;
  const opp = state.players[opponentIndex(idx)]!;
  const blockMap = buildBlockMap(state.walls);

  if (move.kind === 'pawn') {
    if (!inBoard(move.to)) {
      return 'Move out of bounds';
    }
    const legal = getValidPawnMoves(self.position, opp.position, blockMap);
    const ok = legal.some((c) => c.x === move.to.x && c.y === move.to.y);
    return ok ? true : 'Illegal pawn move';
  }

  const wall = move.wall;
  if (!wallInBounds(wall)) {
    return 'Wall out of bounds';
  }
  if (self.wallsRemaining <= 0) {
    return 'No walls remaining';
  }
  for (const w of state.walls) {
    if (wallsConflict(w, wall)) {
      return 'Wall overlaps an existing wall';
    }
  }
  if (!wallPreservesConnectivity(state, wall)) {
    return 'Wall blocks all paths for a player';
  }

  return true;
}

export interface QuoridorApplyResult {
  nextState: QuoridorGameState;
  terminal: boolean;
  winnerUserId?: string;
}

/**
 * Applies a previously validated move (caller should use `validateQuoridorMove` first).
 */
export function applyQuoridorMove(
  state: QuoridorGameState,
  userId: string,
  move: QuoridorMove,
): QuoridorApplyResult {
  const idx = playerIndexByUserId(state, userId) as 0 | 1;
  const self = { ...state.players[idx]! };
  const other = state.players[opponentIndex(idx)]!;
  const nextPlayers: [QuoridorPlayerState, QuoridorPlayerState] =
    idx === 0
      ? [self, { ...other }]
      : [{ ...other }, self];

  let walls = state.walls;
  let terminal = false;
  let winnerUserId: string | undefined;

  if (move.kind === 'pawn') {
    nextPlayers[idx] = {
      ...self,
      position: { ...move.to },
    };
    const gr = goalRowForPlayer(idx);
    if (move.to.y === gr) {
      terminal = true;
      winnerUserId = userId;
    }
  } else {
    walls = [...state.walls, move.wall];
    nextPlayers[idx] = {
      ...self,
      wallsRemaining: self.wallsRemaining - 1,
    };
  }

  const nextTurn = terminal ? userId : other.userId;

  const nextState: QuoridorGameState = {
    ...state,
    players: nextPlayers,
    walls,
    currentTurnUserId: nextTurn,
    winnerUserId: terminal ? winnerUserId : state.winnerUserId,
  };

  return { nextState, terminal, winnerUserId };
}

/**
 * All wall slots (for highlighting valid placements in the UI).
 */
export function* eachPossibleWall(): Generator<QuoridorWall> {
  for (let y = 0; y <= MAX_COORD; y++) {
    for (let x = 0; x <= MAX_COORD; x++) {
      yield { x, y, orientation: 'horizontal' };
      yield { x, y, orientation: 'vertical' };
    }
  }
}

/**
 * Walls the current player may legally place this turn (can be expensive; cache per state).
 */
function comparePositions(a: QuoridorPosition, b: QuoridorPosition): number {
  if (a.y !== b.y) return a.y - b.y;
  return a.x - b.x;
}

function compareWalls(a: QuoridorWall, b: QuoridorWall): number {
  if (a.orientation !== b.orientation) {
    return a.orientation === 'horizontal' ? -1 : 1;
  }
  if (a.y !== b.y) return a.y - b.y;
  return a.x - b.x;
}

/**
 * Deterministic fallback for turn timeouts: prefer a legal pawn step, else first legal wall.
 * Stable ordering (row-major pawn, then wall key) keeps tests and replays predictable.
 */
export function pickAutoQuoridorMove(
  state: QuoridorGameState,
  userId: string,
): QuoridorMove | null {
  if (state.winnerUserId) {
    return null;
  }
  const idxRaw = playerIndexByUserId(state, userId);
  if (idxRaw < 0 || state.currentTurnUserId !== userId) {
    return null;
  }
  const idx = idxRaw as 0 | 1;
  const self = state.players[idx]!;
  const opp = state.players[opponentIndex(idx)]!;
  const blockMap = buildBlockMap(state.walls);

  const pawnDests = [...getValidPawnMoves(self.position, opp.position, blockMap)];
  pawnDests.sort(comparePositions);
  const firstPawn = pawnDests[0];
  if (firstPawn) {
    return { kind: 'pawn', to: firstPawn };
  }

  const walls = getLegalWallPlacements(state, userId);
  if (walls.length === 0) {
    return null;
  }
  const sorted = [...walls].sort(compareWalls);
  return { kind: 'wall', wall: sorted[0]! };
}

export function getLegalWallPlacements(
  state: QuoridorGameState,
  userId: string,
): QuoridorWall[] {
  const idxRaw = playerIndexByUserId(state, userId);
  if (idxRaw < 0) {
    return [];
  }
  const idx = idxRaw as 0 | 1;
  if (
    state.winnerUserId ||
    state.currentTurnUserId !== userId ||
    state.players[idx]!.wallsRemaining <= 0
  ) {
    return [];
  }

  const out: QuoridorWall[] = [];
  for (const wall of eachPossibleWall()) {
    if (validateQuoridorMove(state, userId, { kind: 'wall', wall }) === true) {
      out.push(wall);
    }
  }
  return out;
}
