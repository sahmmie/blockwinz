/**
 * Internal EventEmitter2 + Socket.IO push events on the `game` namespace.
 * Server emits these strings to clients (and listens internally where noted).
 */
export enum MultiplayerGameEmitterEvent {
  SESSION_CREATED = 'session.created',
  LOBBY_UPDATED = 'lobby.updated',
  LOBBY_EXPIRED = 'lobby.expired',
  GAME_CREATED = 'game.created',
  GAME_JOINED = 'game.joined',
  GAME_STARTED = 'game.started',
  GAME_MOVE = 'game.move',
  GAME_INVALID_MOVE = 'game.invalidMove',
  GAME_FINISHED = 'game.finished',
  GAME_CANCELLED = 'game.cancelled',
  PLAYER_AFK = 'player.afk',
  PLAYER_DISCONNECTED = 'player.disconnected',
  /** Redis matchmaking paired two waiters; internal listener creates the session. */
  MATCH_FOUND = 'match.found',
  /** Matchmaking paired players; emitted to their sockets (not in-room broadcast). */
  MATCH_READY = 'match.ready',
}
