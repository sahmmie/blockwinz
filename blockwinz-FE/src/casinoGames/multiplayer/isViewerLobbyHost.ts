import type { MultiplayerSessionRow } from './types';

/**
 * True if the viewer is the lobby host. Prefer `hostUserId` from the server;
 * fall back to first seated player (session creator) when missing.
 */
export function isViewerLobbyHost(
  userId: string | null | undefined,
  session: MultiplayerSessionRow | null | undefined,
): boolean {
  if (!userId || !session) return false;
  const uid = String(userId);
  const hid = session.hostUserId;
  if (hid != null && String(hid) !== '') {
    return String(hid) === uid;
  }
  const first = session.players?.[0];
  return first != null && String(first) === uid;
}
