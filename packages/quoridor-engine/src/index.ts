export type {
  QuoridorBlockMap,
  QuoridorBoardSize,
  QuoridorGameState,
  QuoridorMove,
  QuoridorPlayerState,
  QuoridorPosition,
  QuoridorWall,
  WallOrientation,
} from './types.js';
export { QUORIDOR_BOARD_SIZE } from './types.js';

export { buildBlockMap, wallBlockedEdges, wallsConflict } from './block-map.js';
export { hasPathToGoal } from './pathfinding.js';
export { getValidPawnMoves } from './pawn-moves.js';

export {
  applyQuoridorMove,
  createInitialQuoridorState,
  eachPossibleWall,
  getLegalWallPlacements,
  pickAutoQuoridorMove,
  validateQuoridorMove,
  wallPreservesConnectivity,
} from './game-logic.js';
export type { QuoridorApplyResult } from './game-logic.js';
