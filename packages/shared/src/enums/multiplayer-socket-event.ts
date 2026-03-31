/** Client ↔ server event names on the `game` Socket.IO namespace. */
export enum GameGatewaySocketEvent {
  GET_ACTIVE_GAME = 'getActiveGame',
  NEW_GAME = 'newGame',
  GAME_ACTION = 'gameAction',
  GAME_ERROR = 'gameError',
  JOIN_GAME = 'joinGame',
  DISCONNECT = 'disconnect',
  LEAVE_GAME = 'leaveGame',
  QUICK_MATCH = 'quickMatch',
  /** Remove the caller from Redis quick-match queues for a game (e.g. client wait timeout). */
  CANCEL_QUICK_MATCH = 'cancelQuickMatch',
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
  /** Commit to rematch after a completed session (symmetric with rematchAccept). */
  REMATCH_REQUEST = 'rematchRequest',
  /** Accept a peer’s rematch invite (adds self to the rematch intent set). */
  REMATCH_ACCEPT = 'rematchAccept',
  /** Decline a pending rematch; clears intent and notifies requesters. */
  REMATCH_DECLINE = 'rematchDecline',
  /** Withdraw own rematch intent (Close); notifies the other player. */
  REMATCH_CANCEL = 'rematchCancel',
}

export enum GameGatewayError {
  GAME_NOT_FOUND = 'gameNotFound',
  USER_NOT_AUTHORIZED = 'userNotAuthorized',
}

export enum GameGatewayAction {
  JOIN_ROOM = 'joinRoom',
}
