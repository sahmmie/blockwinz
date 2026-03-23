/**
 * When true, `/lobbies` uses `lobbiesHubStaticData` instead of the socket (UI preview).
 * Default: on in dev; set `VITE_LOBBIES_HUB_STATIC=0` to use live data locally.
 */
export function isLobbyHubStatic(): boolean {
  const v = import.meta.env.VITE_LOBBIES_HUB_STATIC;
  if (v === '0' || v === 'false') return false;
  if (v === '1' || v === 'true') return true;
  return import.meta.env.DEV;
}
