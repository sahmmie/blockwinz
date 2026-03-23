import type { MultiplayerSessionRow } from './types';

/**
 * UI-only join eligibility (server may apply additional rules).
 */
export function getJoinLobbyBlockReason(
  lobby: MultiplayerSessionRow,
  viewerCurrency: string,
  viewerStake: number,
): string | null {
  if (lobby.currency !== viewerCurrency) {
    return 'Switch currency to match this lobby';
  }
  if (lobby.betAmountMustEqual && viewerStake !== lobby.betAmount) {
    return 'Stake must match host (exact stake lobby)';
  }
  return null;
}

export function shortHostLabel(hostUserId?: string | null): string {
  if (!hostUserId) return 'Host';
  return `Player ${hostUserId.replace(/-/g, '').slice(0, 8)}`;
}
