import type { QuoridorBlockMap, QuoridorPosition } from './types.js';
import { QUORIDOR_BOARD_SIZE } from './types.js';

type Dir = 'up' | 'down' | 'left' | 'right';

const DIRS: ReadonlyArray<{ dx: number; dy: number; dir: Dir }> = [
  { dx: 0, dy: -1, dir: 'up' },
  { dx: 0, dy: 1, dir: 'down' },
  { dx: -1, dy: 0, dir: 'left' },
  { dx: 1, dy: 0, dir: 'right' },
];

/**
 * Jump-aware legal pawn destinations for the moving player.
 */
export function getValidPawnMoves(
  pos: QuoridorPosition,
  opponent: QuoridorPosition,
  blockMap: QuoridorBlockMap,
): QuoridorPosition[] {
  const size = QUORIDOR_BOARD_SIZE;
  const moves: QuoridorPosition[] = [];

  for (const d of DIRS) {
    const nx = pos.x + d.dx;
    const ny = pos.y + d.dy;

    if (nx < 0 || nx > size - 1 || ny < 0 || ny > size - 1) continue;
    if (blockMap[d.dir][pos.y]![pos.x]) continue;

    if (nx !== opponent.x || ny !== opponent.y) {
      moves.push({ x: nx, y: ny });
      continue;
    }

    const jumpX = nx + d.dx;
    const jumpY = ny + d.dy;

    const canJump =
      jumpX >= 0 &&
      jumpX <= size - 1 &&
      jumpY >= 0 &&
      jumpY <= size - 1 &&
      !blockMap[d.dir][ny]![nx]!;

    if (canJump) {
      moves.push({ x: jumpX, y: jumpY });
    } else {
      if (d.dir === 'up' || d.dir === 'down') {
        if (!blockMap.left[ny]![nx]) moves.push({ x: nx - 1, y: ny });
        if (!blockMap.right[ny]![nx]) moves.push({ x: nx + 1, y: ny });
      } else {
        if (!blockMap.up[ny]![nx]) moves.push({ x: nx, y: ny - 1 });
        if (!blockMap.down[ny]![nx]) moves.push({ x: nx, y: ny + 1 });
      }
    }
  }

  return dedupePositions(moves);
}

function dedupePositions(list: QuoridorPosition[]): QuoridorPosition[] {
  const seen = new Set<string>();
  const out: QuoridorPosition[] = [];
  for (const p of list) {
    const k = `${p.x},${p.y}`;
    if (!seen.has(k)) {
      seen.add(k);
      out.push(p);
    }
  }
  return out;
}
