/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_REACT_APP_SERVER_BASE_URL: string;
  readonly VITE_REACT_APP_TOKEN_NAME: string;
  readonly VITE_REACT_APP_ENV: string;
  readonly VITE_WAITLIST_LAUNCH_DATE?: string;
  readonly VITE_CHATWOOT_BASE_URL?: string;
  readonly VITE_CHATWOOT_WEBSITE_TOKEN?: string;
  /**
   * Set to `1` or `true` to use dummy lobbies and disable live multiplayer actions.
   * For real BE integration, leave unset or `0`. See `blockwinz-FE/.env.example`.
   */
  readonly VITE_MULTIPLAYER_LOBBY_MOCK?: string;
  /**
   * `0` / `false` = live `listPublicLobbies` on `/lobbies`.
   * Omitted in dev defaults to static preview tables; set `0` for live hub data locally.
   */
  readonly VITE_LOBBIES_HUB_STATIC?: string;
}
