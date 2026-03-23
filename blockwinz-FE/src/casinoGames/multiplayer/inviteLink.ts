import { multiplayerGamesInfo } from '@/shared/constants/multiplayerGamesInfo.constant';
import { MultiplayerGameTypeEnum } from '@blockwinz/shared';

const DEFAULT_PATH =
  multiplayerGamesInfo[MultiplayerGameTypeEnum.TicTacToeGame]?.link ??
  '/multiplayer/tictactoe';

/**
 * Shareable URL for opponents (session id; optional plaintext code for private lobbies).
 */
export function buildTictactoeInviteUrl(
  sessionId: string,
  options?: { joinCode?: string; path?: string },
): string {
  const path = options?.path ?? DEFAULT_PATH;
  const origin =
    typeof window !== 'undefined' && window.location?.origin
      ? window.location.origin
      : 'http://localhost';
  const u = new URL(path, origin);
  u.searchParams.set('session', sessionId);
  const code = options?.joinCode?.trim();
  if (code) u.searchParams.set('code', code);
  return u.toString();
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
