import type { QuoridorBlockMap, QuoridorPosition } from './types.js';
import { QUORIDOR_BOARD_SIZE } from './types.js';

/**
 * BFS using only walls (block map). Pawns are ignored — used for wall placement legality.
 */
export function hasPathToGoal(
  start: QuoridorPosition,
  goalRow: number,
  blockMap: QuoridorBlockMap,
): boolean {
  const size = QUORIDOR_BOARD_SIZE;
  const visited = Array.from({ length: size }, () => Array(size).fill(false));
  const queue: QuoridorPosition[] = [];
  let head = 0;

  queue.push(start);
  visited[start.y]![start.x] = true;

  while (head < queue.length) {
    const { x, y } = queue[head++]!;

    if (y === goalRow) return true;

    const moves = [
      { x, y: y - 1, blocked: blockMap.up[y]![x] },
      { x, y: y + 1, blocked: blockMap.down[y]![x] },
      { x: x - 1, y, blocked: blockMap.left[y]![x] },
      { x: x + 1, y, blocked: blockMap.right[y]![x] },
    ];

    for (const m of moves) {
      if (
        m.x >= 0 &&
        m.x < size &&
        m.y >= 0 &&
        m.y < size &&
        !m.blocked &&
        !visited[m.y]![m.x]
      ) {
        visited[m.y]![m.x] = true;
        queue.push({ x: m.x, y: m.y });
      }
    }
  }

  return false;
}
