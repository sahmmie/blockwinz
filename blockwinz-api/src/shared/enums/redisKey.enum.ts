export enum RedisKey {
  ROOM_MEMBERS = 'room:{roomId}:members',
  USER_ROOMS = 'user:{userId}:rooms',
  USER_SESSIONS = 'user:{userId}:sessions',
  USER_ONLINE = 'user:{userId}:online',
  ROOM_PREVIOUS_MESSAGES = 'room:{roomId}:previous_messages',
  ONLINE_USERS = 'online:users',
  USER_SOCKET_MAP = 'user:socket:map',
  SOCKET_USER_MAP = 'socket:user:map',

  // New keys for enhanced functionality
  CONNECTION_METADATA = 'connection_metadata',
  USER_LAST_SEEN = 'user_last_seen',
  RATE_LIMIT = 'rate_limit',
}
