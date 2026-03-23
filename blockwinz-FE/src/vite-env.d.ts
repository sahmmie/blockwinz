/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Set to `1` or `true` to use dummy lobbies and disable live multiplayer actions. */
  readonly VITE_MULTIPLAYER_LOBBY_MOCK?: string;
  /** `0` / `false` = live lobbies on `/lobbies`. Omitted in dev defaults to sample tables for UI preview. */
  readonly VITE_LOBBIES_HUB_STATIC?: string;
}
