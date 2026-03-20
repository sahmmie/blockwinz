export enum GameGatewaySocketEvent {
  GET_ACTIVE_GAME = 'getActiveGame',
  NEW_GAME = 'newGame',
  GAME_ACTION = 'gameAction',
  GAME_ERROR = 'gameError',
  JOIN_GAME = 'joinGame',
  DISCONNECT = 'disconnect',
  LEAVE_GAME = 'leaveGame',
}

export enum GameGatewayError {
  GAME_NOT_FOUND = 'gameNotFound',
  USER_NOT_AUTHORIZED = 'userNotAuthorized',
}

export enum GameGatewayAction {
  JOIN_ROOM = 'joinRoom',
}
