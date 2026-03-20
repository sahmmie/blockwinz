export enum MultiplayerGameEmitterEvent {
  SESSION_CREATED = 'session.created',
  GAME_CREATED = 'game.created',
  GAME_JOINED = 'game.joined',
  GAME_STARTED = 'game.started',
  GAME_MOVE = 'game.move',
  GAME_INVALID_MOVE = 'game.invalidMove',
  GAME_FINISHED = 'game.finished',
  PLAYER_AFK = 'player.afk',
  PLAYER_DISCONNECTED = 'player.disconnected',
}
