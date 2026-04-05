import { describe, expect, it } from 'vitest';
import { buildBlockMap, wallsConflict } from './block-map.js';
import {
  applyQuoridorMove,
  createInitialQuoridorState,
  pickAutoQuoridorMove,
  validateQuoridorMove,
  wallPreservesConnectivity,
} from './game-logic.js';
import { getValidPawnMoves } from './pawn-moves.js';
import { hasPathToGoal } from './pathfinding.js';
import type { QuoridorGameState } from './types.js';

describe('buildBlockMap / wallsConflict', () => {
  it('flags identical walls as conflict', () => {
    const w = { x: 3, y: 3, orientation: 'horizontal' as const };
    expect(wallsConflict(w, w)).toBe(true);
  });

  it('flags overlapping parallel walls', () => {
    const a = { x: 2, y: 1, orientation: 'horizontal' as const };
    const b = { x: 3, y: 1, orientation: 'horizontal' as const };
    expect(wallsConflict(a, b)).toBe(true);
  });

  it('allows perpendicular non-crossing walls', () => {
    const a = { x: 0, y: 0, orientation: 'horizontal' as const };
    const b = { x: 2, y: 2, orientation: 'vertical' as const };
    expect(wallsConflict(a, b)).toBe(false);
  });
});

describe('hasPathToGoal', () => {
  it('finds straight path on empty board', () => {
    const map = buildBlockMap([]);
    expect(hasPathToGoal({ x: 4, y: 0 }, 8, map)).toBe(true);
    expect(hasPathToGoal({ x: 4, y: 8 }, 0, map)).toBe(true);
  });

  it('returns false when a wall seals the row corridor', () => {
    const walls = Array.from({ length: 8 }, (_, x) => ({
      x,
      y: 3,
      orientation: 'horizontal' as const,
    }));
    const map = buildBlockMap(walls);
    expect(hasPathToGoal({ x: 4, y: 0 }, 8, map)).toBe(false);
  });
});

describe('getValidPawnMoves', () => {
  it('allows straight jump over adjacent opponent', () => {
    const map = buildBlockMap([]);
    const pos = { x: 4, y: 3 };
    const opp = { x: 4, y: 4 };
    const moves = getValidPawnMoves(pos, opp, map);
    expect(moves.some((m) => m.x === 4 && m.y === 5)).toBe(true);
  });

  it('allows sideways moves when jump is blocked', () => {
    const walls = [{ x: 4, y: 4, orientation: 'horizontal' as const }];
    const map = buildBlockMap(walls);
    const pos = { x: 4, y: 3 };
    const opp = { x: 4, y: 4 };
    const moves = getValidPawnMoves(pos, opp, map);
    expect(moves.some((m) => m.x === 3 && m.y === 4)).toBe(true);
    expect(moves.some((m) => m.x === 5 && m.y === 4)).toBe(true);
    expect(moves.some((m) => m.x === 4 && m.y === 5)).toBe(false);
  });
});

describe('validateQuoridorMove / applyQuoridorMove', () => {
  it('rejects pawn move onto opponent cell without jump', () => {
    const state = createInitialQuoridorState('a', 'b', 'a');
    const v = validateQuoridorMove(state, 'a', {
      kind: 'pawn',
      to: { x: 4, y: 8 },
    });
    expect(v).not.toBe(true);
  });

  it('accepts winning pawn move to goal row', () => {
    const state: QuoridorGameState = {
      ...createInitialQuoridorState('a', 'b', 'a'),
      players: [
        {
          userId: 'a',
          position: { x: 4, y: 7 },
          wallsRemaining: 10,
        },
        {
          userId: 'b',
          position: { x: 3, y: 8 },
          wallsRemaining: 10,
        },
      ],
    };
    expect(
      validateQuoridorMove(state, 'a', { kind: 'pawn', to: { x: 4, y: 8 } }),
    ).toBe(true);
    const { nextState, terminal, winnerUserId } = applyQuoridorMove(
      state,
      'a',
      { kind: 'pawn', to: { x: 4, y: 8 } },
    );
    expect(terminal).toBe(true);
    expect(winnerUserId).toBe('a');
    expect(nextState.winnerUserId).toBe('a');
  });

  it('rejects wall that disconnects a player', () => {
    const walls = Array.from({ length: 8 }, (_, x) => ({
      x,
      y: 3,
      orientation: 'horizontal' as const,
    }));
    const state: QuoridorGameState = {
      boardSize: 9,
      players: [
        { userId: 'a', position: { x: 4, y: 0 }, wallsRemaining: 1 },
        { userId: 'b', position: { x: 4, y: 8 }, wallsRemaining: 10 },
      ],
      walls,
      currentTurnUserId: 'a',
    };
    const extra = { x: 0, y: 4, orientation: 'horizontal' as const };
    expect(wallPreservesConnectivity(state, extra)).toBe(false);
    expect(
      validateQuoridorMove(state, 'a', { kind: 'wall', wall: extra }),
    ).not.toBe(true);
  });

  it('switches turn after legal wall', () => {
    const state = createInitialQuoridorState('a', 'b', 'a');
    const wall = { x: 2, y: 4, orientation: 'vertical' as const };
    expect(validateQuoridorMove(state, 'a', { kind: 'wall', wall })).toBe(
      true,
    );
    const { nextState } = applyQuoridorMove(state, 'a', {
      kind: 'wall',
      wall,
    });
    expect(nextState.currentTurnUserId).toBe('b');
    expect(nextState.players[0]!.wallsRemaining).toBe(9);
    expect(nextState.walls).toHaveLength(1);
  });
});

describe('pickAutoQuoridorMove', () => {
  it('returns a legal pawn move when any exist (prefers stable row-major first)', () => {
    const state = createInitialQuoridorState('a', 'b', 'a');
    const m = pickAutoQuoridorMove(state, 'a');
    expect(m).not.toBeNull();
    expect(m!.kind).toBe('pawn');
    expect(validateQuoridorMove(state, 'a', m!)).toBe(true);
  });

  it('returns null when not that player’s turn', () => {
    const state = createInitialQuoridorState('a', 'b', 'a');
    expect(pickAutoQuoridorMove(state, 'b')).toBeNull();
  });
});
