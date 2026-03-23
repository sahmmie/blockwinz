export enum GameGatewaySocketEvent {
  GET_ACTIVE_GAME = 'getActiveGame',
  NEW_GAME = 'newGame',
  GAME_ACTION = 'gameAction',
  GAME_ERROR = 'gameError',
  JOIN_GAME = 'joinGame',
  DISCONNECT = 'disconnect',
  LEAVE_GAME = 'leaveGame',
  QUICK_MATCH = 'quickMatch',
  LIST_PUBLIC_LOBBIES = 'listPublicLobbies',
  /** Join Socket.IO room `room:{sessionId}` for realtime `game.*` events. */
  JOIN_SESSION_ROOM = 'joinSessionRoom',
  /** Leave the session room (socket stays connected). */
  LEAVE_SESSION_ROOM = 'leaveSessionRoom',
  /** Subscribe to `lobby.updated` / `lobby.expired` for a game type. */
  JOIN_LOBBY_ROOM = 'joinLobbyRoom',
  LEAVE_LOBBY_ROOM = 'leaveLobbyRoom',
  /** Join `room:{sessionId}` as a spectator when allowed by the session row. */
  JOIN_SPECTATOR_SESSION = 'joinSpectatorSession',
}

export enum GameGatewayError {
  GAME_NOT_FOUND = 'gameNotFound',
  USER_NOT_AUTHORIZED = 'userNotAuthorized',
}

export enum GameGatewayAction {
  JOIN_ROOM = 'joinRoom',
}
