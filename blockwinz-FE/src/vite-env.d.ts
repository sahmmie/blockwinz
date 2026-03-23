/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Set to `1` or `true` to use dummy lobbies and disable live multiplayer actions. */
  readonly VITE_MULTIPLAYER_LOBBY_MOCK?: string;
}
