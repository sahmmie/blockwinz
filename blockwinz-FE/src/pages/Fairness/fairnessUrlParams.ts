import { GameTypeEnum } from '@blockwinz/shared';

export const PF_KEYS = {
  TAB: 'pfTab',
  GAME: 'pfGame',
  CLIENT: 'pfClient',
  SERVER: 'pfServer',
  NONCE: 'pfNonce',
  RISK: 'pfRisk',
  ROWS: 'pfRows',
  MINES: 'pfMines',
  SEGMENTS: 'pfSegments',
  MULTIPLIER: 'pfMul',
} as const;

export type FairnessRisk = 'LOW' | 'MEDIUM' | 'HIGH';

export type ParsedFairnessUrl = {
  tab: 'seeds' | 'verify' | null;
  game: GameTypeEnum | null;
  clientSeed: string | null;
  serverSeed: string | null;
  nonce: number | null;
  risk: FairnessRisk | null;
  rows: number | null;
  mines: number | null;
  segments: number | null;
  multiplier: number | null;
};

function parseIntStrict(s: string | null): number | null {
  if (s == null || s === '') return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

function parseGameTypeEnum(v: string | null): GameTypeEnum | null {
  if (!v) return null;
  return (Object.values(GameTypeEnum) as string[]).includes(v)
    ? (v as GameTypeEnum)
    : null;
}

function parseRisk(v: string | null): FairnessRisk | null {
  if (v === 'LOW' || v === 'MEDIUM' || v === 'HIGH') return v;
  return null;
}

export function parseFairnessUrlSearch(sp: URLSearchParams): ParsedFairnessUrl {
  const tabRaw = sp.get(PF_KEYS.TAB);
  const mul = sp.get(PF_KEYS.MULTIPLIER);
  return {
    tab: tabRaw === 'verify' || tabRaw === 'seeds' ? tabRaw : null,
    game: parseGameTypeEnum(sp.get(PF_KEYS.GAME)),
    clientSeed: sp.get(PF_KEYS.CLIENT),
    serverSeed: sp.get(PF_KEYS.SERVER),
    nonce: parseIntStrict(sp.get(PF_KEYS.NONCE)),
    risk: parseRisk(sp.get(PF_KEYS.RISK)),
    rows: parseIntStrict(sp.get(PF_KEYS.ROWS)),
    mines: parseIntStrict(sp.get(PF_KEYS.MINES)),
    segments: parseIntStrict(sp.get(PF_KEYS.SEGMENTS)),
    multiplier:
      mul != null && mul !== '' && !Number.isNaN(Number(mul))
        ? Number(mul)
        : null,
  };
}

/** Remove game-specific verify options (risk, rows, mines, segments). */
export function stripPfGameConfigParams(prev: URLSearchParams): URLSearchParams {
  const n = new URLSearchParams(prev);
  n.delete(PF_KEYS.RISK);
  n.delete(PF_KEYS.ROWS);
  n.delete(PF_KEYS.MINES);
  n.delete(PF_KEYS.SEGMENTS);
  return n;
}

type PatchValue = string | number | null | undefined;

/** Update fairness query keys; `undefined` skips, `null` deletes. */
export function patchFairnessUrlParams(
  prev: URLSearchParams,
  patch: Partial<Record<string, PatchValue>>,
): URLSearchParams {
  const n = new URLSearchParams(prev);
  for (const [key, val] of Object.entries(patch)) {
    if (val === undefined) continue;
    if (val === null || val === '') n.delete(key);
    else n.set(key, String(val));
  }
  return n;
}
