import { Socket } from 'socket.io';
import { WebSocketGateway, WsException } from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Logger, Injectable, UseGuards } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AuthenticationRepository } from 'src/authentication/repositories/authentication.repository';
import { RedisService } from '../shared/services/redis.service';
import { RedisKey } from '../shared/enums/redisKey.enum';
import { WsAuthGuard } from 'src/shared/guards/ws-auth.guard';

export interface GatewayConfig {
  maxConnectionsPerUser?: number;
  heartbeatInterval?: number;
  jwtSecret?: string;
  enableConnectionMetadata?: boolean;
  connectionTimeout?: number;
  rateLimitWindow?: number;
  rateLimitMaxConnections?: number;
}

export interface ConnectionMetadata {
  userId: string;
  connectedAt: number;
  userAgent?: string;
  ip?: string;
  lastSeen: number;
}

export interface UserConnectionEvent {
  userId: string;
  socketId: string;
  user: any;
  connectionCount: number;
  isFirstConnection: boolean;
}

export interface UserDisconnectionEvent {
  userId: string;
  socketId: string;
  user?: any;
  connectionCount: number;
  isLastConnection: boolean;
}

@WebSocketGateway({
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  },
  transports: ['websocket'],
  allowEIO3: true,
  pingTimeout: 60000, // Disconnect if no pong in 60s
  pingInterval: 25000, // Send ping every 25s
})
@UseGuards(WsAuthGuard)
@Injectable()
export abstract class BaseGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  protected logger = new Logger(BaseGateway.name);
  private connectionAttempts = new Map<
    string,
    { count: number; firstAttempt: number }
  >();

  protected readonly config: Required<GatewayConfig>;

  constructor(
    protected jwtService: JwtService,
    protected redisService: RedisService,
    protected readonly authenticationRepository: AuthenticationRepository,
    protected eventEmitter: EventEmitter2,
    config: GatewayConfig = {},
  ) {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET environment variable is required');
    }

    this.config = {
      maxConnectionsPerUser: 5,
      heartbeatInterval: 30000, // unused now
      jwtSecret: process.env.JWT_SECRET,
      enableConnectionMetadata: true,
      connectionTimeout: 60000, // optional fallback
      rateLimitWindow: 60000,
      rateLimitMaxConnections: 10,
      ...config,
    };
  }

  async handleConnection(client: Socket): Promise<any> {
    const startTime = Date.now();

    try {
      await this.checkRateLimit(client);
      const token = this.extractToken(client);
      const payload = await this.verifyToken(token);
      const user = await this.getUser(payload._id);

      await this.checkConnectionLimits(payload._id);
      const userId = payload._id;
      const socketId = client.id;

      await this.storeConnectionMappings(socketId, userId);

      if (this.config.enableConnectionMetadata) {
        await this.storeConnectionMetadata(client, userId);
      }

      const { connectionCount, isFirstConnection } =
        await this.updateUserOnlineStatus(userId);

      client.data.user = user;
      client.data.userId = userId;
      client.data.connectedAt = startTime;

      this.eventEmitter.emit('user.connected', {
        userId,
        socketId,
        user,
        connectionCount,
        isFirstConnection,
      });

      this.logger.log(
        `User ${user.username} connected with socket ${socketId} ` +
          `(${connectionCount} active connections) - ${Date.now() - startTime}ms`,
      );

      await this.onUserConnected();
    } catch (error) {
      client.emit('error', {
        message: `Authentication failed: ${error.message}`,
        code: error instanceof WsException ? 'WS_UNAUTHORIZED' : 'WS_ERROR',
      });
      client.disconnect(true);

      this.eventEmitter.emit('user.connection.failed', {
        socketId: client.id,
        error: error.message,
        ip: client.handshake.address,
      });
    }
  }

  async handleDisconnect(client: Socket) {
    const startTime = Date.now();

    try {
      const userId = client.data?.userId;
      const socketId = client.id;
      const user = client.data?.user;

      if (userId && socketId) {
        await this.cleanupConnectionMappings(socketId, userId);
        if (this.config.enableConnectionMetadata) {
          await this.cleanupConnectionMetadata(socketId);
        }

        const { connectionCount, isLastConnection } =
          await this.updateUserOfflineStatus(userId);

        this.eventEmitter.emit('user.disconnected', {
          userId,
          socketId,
          user,
          connectionCount,
          isLastConnection,
        });

        this.logger.log(
          `User ${user?.username || userId} disconnected from socket ${socketId} ` +
            `(${connectionCount} remaining connections) - ${Date.now() - startTime}ms`,
        );

        await this.onUserDisconnected();
      } else {
        this.logger.warn(
          `No user data found for socket ${socketId} on disconnect`,
        );
      }
    } catch (error) {
      this.logger.error('Error handling disconnect:', error);
    }
  }

  // Rate limiting
  private async checkRateLimit(client: Socket): Promise<void> {
    const ip = client.handshake.address;
    const now = Date.now();

    // Clean up expired entries periodically
    this.cleanupExpiredRateLimitEntries();

    let attempts = this.connectionAttempts.get(ip);
    if (!attempts) {
      attempts = { count: 1, firstAttempt: now };
      this.connectionAttempts.set(ip, attempts);
      return;
    }

    // Reset counter if window expired
    if (now - attempts.firstAttempt > this.config.rateLimitWindow) {
      attempts.count = 1;
      attempts.firstAttempt = now;
      return;
    }

    attempts.count++;

    if (attempts.count > this.config.rateLimitMaxConnections) {
      throw new WsException('Too many connection attempts');
    }
  }

  // Clean up expired rate limit entries to prevent memory leaks
  private cleanupExpiredRateLimitEntries(): void {
    const now = Date.now();
    const expiredIps: string[] = [];

    for (const [ip, attempts] of this.connectionAttempts.entries()) {
      if (now - attempts.firstAttempt > this.config.rateLimitWindow) {
        expiredIps.push(ip);
      }
    }

    // Remove expired entries
    expiredIps.forEach((ip) => this.connectionAttempts.delete(ip));
  }

  // Token extraction
  private extractToken(client: Socket): string {
    const token =
      client.handshake.auth?.token ||
      client.handshake.headers?.authorization?.replace('Bearer ', '');

    if (!token) {
      throw new WsException('No authentication token provided');
    }

    return token;
  }

  // Token verification
  private async verifyToken(token: string): Promise<{ _id: string }> {
    try {
      const payload = await this.jwtService.verifyAsync<{ _id: string }>(
        token,
        { secret: this.config.jwtSecret },
      );

      if (!payload || !payload._id) {
        throw new WsException('Invalid token payload');
      }

      return payload;
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new WsException('Token expired');
      }
      if (error.name === 'JsonWebTokenError') {
        throw new WsException('Invalid token');
      }
      throw new WsException('Token verification failed');
    }
  }

  // User retrieval
  private async getUser(userId: string): Promise<any> {
    const user =
      await this.authenticationRepository.findUserWithProfile(userId);
    if (!user) {
      throw new WsException('User not found');
    }
    return user;
  }

  // Connection limits check
  private async checkConnectionLimits(userId: string): Promise<void> {
    const currentConnections = await this.redisService.sCard(
      `${RedisKey.USER_SOCKET_MAP}:${userId}`,
    );

    // If the user has reached the maximum number of connections, remove the oldest connection
    if (
      currentConnections >= this.config.maxConnectionsPerUser &&
      currentConnections > 0
    ) {
      const oldestConnection = await this.redisService.sPop(
        `${RedisKey.USER_SOCKET_MAP}:${userId}`,
      );
      if (oldestConnection) {
        this.logger.warn(
          `Removing oldest connection for user ${userId}: ${oldestConnection}`,
        );
        await this.redisService.sRem(
          `${RedisKey.USER_SOCKET_MAP}:${userId}`,
          oldestConnection,
        );
      }
    }
  }

  // Store connection mappings
  private async storeConnectionMappings(
    socketId: string,
    userId: string,
  ): Promise<void> {
    await Promise.all([
      // Store socket-to-user mapping
      this.redisService.hSet(RedisKey.SOCKET_USER_MAP, socketId, userId),
      // Add socket to user's socket set
      this.redisService.sAdd(`${RedisKey.USER_SOCKET_MAP}:${userId}`, socketId),
    ]);
  }

  // Store connection metadata
  private async storeConnectionMetadata(
    client: Socket,
    userId: string,
  ): Promise<void> {
    const metadata: ConnectionMetadata = {
      userId,
      connectedAt: Date.now(),
      userAgent: client.handshake.headers['user-agent'],
      ip: client.handshake.address,
      lastSeen: Date.now(),
    };

    // hMSet not available, set each field individually
    for (const [field, value] of Object.entries(metadata)) {
      await this.redisService.hSet(
        `${RedisKey.CONNECTION_METADATA}:${client.id}`,
        field,
        value.toString(),
      );
    }
  }

  // Update user online status
  private async updateUserOnlineStatus(
    userId: string,
  ): Promise<{ connectionCount: number; isFirstConnection: boolean }> {
    const connectionCount = await this.redisService.sCard(
      `${RedisKey.USER_SOCKET_MAP}:${userId}`,
    );
    const isFirstConnection = connectionCount === 1;

    if (isFirstConnection) {
      await this.redisService.sAdd(RedisKey.ONLINE_USERS, userId);
    }

    return { connectionCount, isFirstConnection };
  }

  // Cleanup connection mappings
  private async cleanupConnectionMappings(
    socketId: string,
    userId: string,
  ): Promise<void> {
    await Promise.all([
      this.redisService.hDel(RedisKey.SOCKET_USER_MAP, socketId),
      this.redisService.sRem(`${RedisKey.USER_SOCKET_MAP}:${userId}`, socketId),
    ]);
  }

  // Cleanup connection metadata
  private async cleanupConnectionMetadata(socketId: string): Promise<void> {
    await this.redisService.delKey(
      `${RedisKey.CONNECTION_METADATA}:${socketId}`,
    );
  }

  // Update user offline status
  private async updateUserOfflineStatus(
    userId: string,
  ): Promise<{ connectionCount: number; isLastConnection: boolean }> {
    const connectionCount = await this.redisService.sCard(
      `${RedisKey.USER_SOCKET_MAP}:${userId}`,
    );
    const isLastConnection = connectionCount === 0;

    if (isLastConnection) {
      await this.redisService.sRem(RedisKey.ONLINE_USERS, userId);
    }

    return { connectionCount, isLastConnection };
  }

  // Graceful shutdown
  async gracefulShutdown(): Promise<void> {
    this.logger.log('Starting graceful shutdown...');

    try {
      // Get all active connections
      const allConnections = await this.redisService.hGetAll(
        RedisKey.SOCKET_USER_MAP,
      );

      // Clean up all connections
      const cleanupPromises = Object.entries(allConnections).map(
        ([socketId, userId]) => this.cleanupConnection(socketId, userId),
      );

      await Promise.all(cleanupPromises);

      this.logger.log('Graceful shutdown completed');
    } catch (error) {
      this.logger.error('Error during graceful shutdown:', error);
    }
  }

  private async cleanupConnection(
    socketId: string,
    userId: string,
  ): Promise<void> {
    await Promise.all([
      this.redisService.hDel(RedisKey.SOCKET_USER_MAP, socketId),
      this.redisService.sRem(`${RedisKey.USER_SOCKET_MAP}:${userId}`, socketId),
      this.config.enableConnectionMetadata
        ? this.redisService.delKey(
            `${RedisKey.CONNECTION_METADATA}:${socketId}`,
          )
        : Promise.resolve(),
    ]);

    const remainingSockets = await this.redisService.sCard(
      `${RedisKey.USER_SOCKET_MAP}:${userId}`,
    );
    if (remainingSockets === 0) {
      await this.redisService.sRem(RedisKey.ONLINE_USERS, userId);
    }
  }

  // Public helper methods

  // Get all online users
  async getOnlineUsers(): Promise<string[]> {
    return this.redisService.sMembers(RedisKey.ONLINE_USERS);
  }

  // Check if user is online
  async isUserOnline(userId: string): Promise<boolean> {
    return (
      (await this.redisService.sIsMember(RedisKey.ONLINE_USERS, userId)) === 1
    );
  }

  // Get user's socket IDs
  async getUserSocketIds(userId: string): Promise<string[]> {
    return this.redisService.sMembers(`${RedisKey.USER_SOCKET_MAP}:${userId}`);
  }

  // Get user ID from socket ID
  async getUserIdFromSocket(socketId: string): Promise<string | null> {
    return this.redisService.hGet(RedisKey.SOCKET_USER_MAP, socketId);
  }

  // Get user's active connection count
  async getUserConnectionCount(userId: string): Promise<number> {
    return this.redisService.sCard(`${RedisKey.USER_SOCKET_MAP}:${userId}`);
  }

  // Get connection metadata
  async getConnectionMetadata(
    socketId: string,
  ): Promise<ConnectionMetadata | null> {
    if (!this.config.enableConnectionMetadata) {
      return null;
    }

    const metadata = await this.redisService.hGetAll(
      `${RedisKey.CONNECTION_METADATA}:${socketId}`,
    );
    if (!metadata || Object.keys(metadata).length === 0) {
      return null;
    }

    return {
      userId: metadata.userId,
      connectedAt: parseInt(metadata.connectedAt),
      userAgent: metadata.userAgent,
      ip: metadata.ip,
      lastSeen: parseInt(metadata.lastSeen),
    };
  }

  // Get all connections for a user with metadata
  async getUserConnectionsWithMetadata(
    userId: string,
  ): Promise<(ConnectionMetadata | null)[]> {
    const socketIds = await this.getUserSocketIds(userId);
    return Promise.all(
      socketIds.map((socketId) => this.getConnectionMetadata(socketId)),
    );
  }

  // Get connection statistics
  async getConnectionStats(): Promise<{
    totalOnlineUsers: number;
    totalConnections: number;
    averageConnectionsPerUser: number;
    rateLimitEntries: number;
  }> {
    const [totalOnlineUsers, totalConnections] = await Promise.all([
      this.getOnlineUsers().then((users) => users.length),
      this.redisService
        .hGetAll(RedisKey.SOCKET_USER_MAP)
        .then((connections) => Object.keys(connections).length),
    ]);

    return {
      totalOnlineUsers,
      totalConnections,
      averageConnectionsPerUser:
        totalOnlineUsers > 0 ? totalConnections / totalOnlineUsers : 0,
      rateLimitEntries: this.connectionAttempts.size,
    };
  }

  // Get user's connection history (if metadata is enabled)
  async getUserConnectionHistory(
    userId: string,
    limit: number = 10,
  ): Promise<ConnectionMetadata[]> {
    if (!this.config.enableConnectionMetadata) {
      return [];
    }

    const socketIds = await this.getUserSocketIds(userId);
    const metadataPromises = socketIds.map((socketId) =>
      this.getConnectionMetadata(socketId),
    );
    const metadataResults = await Promise.all(metadataPromises);

    return metadataResults
      .filter((metadata): metadata is ConnectionMetadata => metadata !== null)
      .sort((a, b) => b.connectedAt - a.connectedAt)
      .slice(0, limit);
  }

  // Check if a specific socket is still connected
  async isSocketConnected(socketId: string): Promise<boolean> {
    const userId = await this.getUserIdFromSocket(socketId);
    if (!userId) return false;

    const userSockets = await this.getUserSocketIds(userId);
    return userSockets.includes(socketId);
  }

  // Force disconnect user
  async forceDisconnectUser(userId: string, reason?: string): Promise<void> {
    const socketIds = await this.getUserSocketIds(userId);

    // Emit disconnect reason to all user's sockets
    for (const socketId of socketIds) {
      this.emitToSocket(socketId, 'force_disconnect', { reason });
    }

    // Clean up Redis data
    await Promise.all([
      this.redisService.delKey(`${RedisKey.USER_SOCKET_MAP}:${userId}`),
      this.redisService.sRem(RedisKey.ONLINE_USERS, userId),
      ...socketIds.map((socketId) =>
        Promise.all([
          this.redisService.hDel(RedisKey.SOCKET_USER_MAP, socketId),
          this.config.enableConnectionMetadata
            ? this.redisService.delKey(
                `${RedisKey.CONNECTION_METADATA}:${socketId}`,
              )
            : Promise.resolve(),
        ]),
      ),
    ]);

    this.logger.log(
      `Force disconnected user ${userId}. Reason: ${reason || 'No reason provided'}`,
    );
  }

  // Get socket instance by ID (to be implemented by child classes)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected getSocketById(socketId: string): Socket | null {
    // This should be implemented by child classes that have access to the Socket.IO server
    return null;
  }

  // Force disconnect specific socket
  async forceDisconnectSocket(
    socketId: string,
    reason?: string,
  ): Promise<void> {
    const socket = this.getSocketById(socketId);
    if (socket) {
      socket.emit('force_disconnect', { reason });
      socket.disconnect(true);
    } else {
      this.emitToSocket(socketId, 'force_disconnect', { reason });
    }

    // Clean up Redis data for this socket
    const userId = await this.getUserIdFromSocket(socketId);
    if (userId) {
      await Promise.all([
        this.redisService.hDel(RedisKey.SOCKET_USER_MAP, socketId),
        this.redisService.sRem(
          `${RedisKey.USER_SOCKET_MAP}:${userId}`,
          socketId,
        ),
        this.config.enableConnectionMetadata
          ? this.redisService.delKey(
              `${RedisKey.CONNECTION_METADATA}:${socketId}`,
            )
          : Promise.resolve(),
      ]);

      // Check if user has no more connections
      const remainingSockets = await this.getUserConnectionCount(userId);
      if (remainingSockets === 0) {
        await this.redisService.sRem(RedisKey.ONLINE_USERS, userId);
      }
    }

    this.logger.log(
      `Force disconnected socket ${socketId}. Reason: ${reason || 'No reason provided'}`,
    );
  }

  // Abstract method for socket emission (implement based on your setup)
  protected abstract emitToSocket(
    socketId: string,
    event: string,
    data: any,
  ): void;

  // Hook methods for child classes to override
  protected async onUserConnected(/*client: Socket, user: any*/): Promise<void> {
    // Override in child classes
  }

  protected async onUserDisconnected(/*client: Socket, user?: any*/): Promise<void> {
    // Override in child classes
  }

  // Get online users with additional info
  async getOnlineUsersWithInfo(): Promise<
    Array<{
      userId: string;
      connectionCount: number;
      connections: (ConnectionMetadata | null)[];
    }>
  > {
    const onlineUserIds = await this.getOnlineUsers();

    return Promise.all(
      onlineUserIds.map(async (userId) => ({
        userId,
        connectionCount: await this.getUserConnectionCount(userId),
        connections: await this.getUserConnectionsWithMetadata(userId),
      })),
    );
  }

  // Health check method
  async healthCheck(): Promise<{
    totalOnlineUsers: number;
    totalConnections: number;
    redisConnected: boolean;
    rateLimitEntries: number;
  }> {
    try {
      const [totalOnlineUsers, allConnections] = await Promise.all([
        this.redisService.sCard(RedisKey.ONLINE_USERS),
        // More efficient way to count connections
        this.redisService
          .hGetAll(RedisKey.SOCKET_USER_MAP)
          .then((connections) => Object.keys(connections).length),
      ]);

      return {
        totalOnlineUsers,
        totalConnections: allConnections,
        redisConnected: true,
        rateLimitEntries: this.connectionAttempts.size,
      };
    } catch (error) {
      this.logger.error('Health check failed:', error);
      return {
        totalOnlineUsers: 0,
        totalConnections: 0,
        redisConnected: false,
        rateLimitEntries: this.connectionAttempts.size,
      };
    }
  }
}
