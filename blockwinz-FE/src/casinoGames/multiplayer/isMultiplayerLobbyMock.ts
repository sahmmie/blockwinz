/**
 * When true, lobby list and actions use dummy data / toasts (no live socket).
 * Set `VITE_MULTIPLAYER_LOBBY_MOCK=1` in `.env` for the web package.
 */
export function isMultiplayerLobbyMock(): boolean {
  const v = import.meta.env.VITE_MULTIPLAYER_LOBBY_MOCK;
  return v === '1' || v === 'true';
}
