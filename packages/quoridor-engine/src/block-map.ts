import type { QuoridorBlockMap, QuoridorWall } from './types.js';
import { QUORIDOR_BOARD_SIZE } from './types.js';

/**
 * Builds movement block flags from placed walls (server and client must share this).
 */
export function buildBlockMap(walls: QuoridorWall[]): QuoridorBlockMap {
  const size = QUORIDOR_BOARD_SIZE;

  const map: QuoridorBlockMap = {
    up: Array.from({ length: size }, () => Array(size).fill(false)),
    down: Array.from({ length: size }, () => Array(size).fill(false)),
    left: Array.from({ length: size }, () => Array(size).fill(false)),
    right: Array.from({ length: size }, () => Array(size).fill(false)),
  };

  for (const wall of walls) {
    const { x, y, orientation } = wall;

    if (orientation === 'horizontal') {
      map.down[y]![x] = true;
      map.down[y]![x + 1] = true;
      map.up[y + 1]![x] = true;
      map.up[y + 1]![x + 1] = true;
    } else {
      map.right[y]![x] = true;
      map.right[y + 1]![x] = true;
      map.left[y]![x + 1] = true;
      map.left[y + 1]![x + 1] = true;
    }
  }

  return map;
}

/**
 * Directed edges blocked by a single wall (for overlap / crossing detection).
 */
export function wallBlockedEdges(wall: QuoridorWall): Set<string> {
  const { x, y, orientation } = wall;
  const edges = new Set<string>();
  const key = (cx: number, cy: number, d: string) => edges.add(`${cx},${cy},${d}`);

  if (orientation === 'horizontal') {
    key(x, y, 'down');
    key(x + 1, y, 'down');
    key(x, y + 1, 'up');
    key(x + 1, y + 1, 'up');
  } else {
    key(x, y, 'right');
    key(x, y + 1, 'right');
    key(x + 1, y, 'left');
    key(x + 1, y + 1, 'left');
  }

  return edges;
}

/**
 * True if two walls share a fence segment (illegal in Quoridor).
 */
export function wallsConflict(a: QuoridorWall, b: QuoridorWall): boolean {
  if (
    a.x === b.x &&
    a.y === b.y &&
    a.orientation === b.orientation
  ) {
    return true;
  }
  const ea = wallBlockedEdges(a);
  for (const e of wallBlockedEdges(b)) {
    if (ea.has(e)) return true;
  }
  return false;
}
