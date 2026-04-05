import { multiplayerGamesInfo } from '@/shared/constants/multiplayerGamesInfo.constant';
import { MultiplayerGameTypeEnum } from '@blockwinz/shared';

const FALLBACK_INVITE_PATH = '/multiplayer/tictactoe';

const KNOWN_MULTIPLAYER_PATHS: string[] = Object.values(
  multiplayerGamesInfo,
)
  .map((g) => g?.link)
  .filter((l): l is string => Boolean(l));

/**
 * Route segment for invite / QR links. Uses catalog metadata, then the current
 * page path when it is a known multiplayer route (avoids wrong-game links).
 */
export function resolveMultiplayerInvitePath(
  gameType: MultiplayerGameTypeEnum,
): string {
  const meta = multiplayerGamesInfo[gameType];
  if (meta?.link) return meta.link;
  if (typeof window !== 'undefined') {
    const path = window.location.pathname;
    if (KNOWN_MULTIPLAYER_PATHS.includes(path)) return path;
  }
  return (
    multiplayerGamesInfo[MultiplayerGameTypeEnum.TicTacToeGame]?.link ??
    FALLBACK_INVITE_PATH
  );
}

/**
 * Shareable URL for opponents (session id; optional plaintext code for private lobbies).
 * @param options.path — Must be the game route (e.g. `/multiplayer/quoridor`).
 */
export function buildMultiplayerInviteUrl(
  sessionId: string,
  options: { path: string; joinCode?: string },
): string {
  const path = options.path.startsWith('/') ? options.path : `/${options.path}`;
  const origin =
    typeof window !== 'undefined' && window.location?.origin
      ? window.location.origin
      : 'http://localhost';
  const u = new URL(path, origin);
  u.searchParams.set('session', sessionId);
  const code = options.joinCode?.trim();
  if (code) u.searchParams.set('code', code);
  return u.toString();
}

/**
 * @deprecated Prefer `buildMultiplayerInviteUrl` with an explicit `path` from `multiplayerGamesInfo`.
 */
export function buildTictactoeInviteUrl(
  sessionId: string,
  options?: { joinCode?: string; path?: string },
): string {
  const path =
    options?.path ??
    multiplayerGamesInfo[MultiplayerGameTypeEnum.TicTacToeGame]?.link ??
    FALLBACK_INVITE_PATH;
  return buildMultiplayerInviteUrl(sessionId, {
    path,
    joinCode: options?.joinCode,
  });
}

export function formatInvitePlainText(opts: {
  gameLabel: string;
  betAmount: number;
  currency: string;
  sessionId: string;
  joinCode?: string;
  inviteUrl: string;
}): string {
  const cur = opts.currency.toUpperCase();
  const lines = [
    `${opts.gameLabel} on Blockwinz`,
    `Stake: ${opts.betAmount} ${cur}`,
    `Session ID: ${opts.sessionId}`,
  ];
  if (opts.joinCode) lines.push(`Join code: ${opts.joinCode}`);
  lines.push(`Link: ${opts.inviteUrl}`);
  return lines.join('\n');
}
