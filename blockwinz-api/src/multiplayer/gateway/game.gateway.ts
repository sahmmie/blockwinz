import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards, UseFilters } from '@nestjs/common';
import { getUserId } from 'src/shared/helpers/user.helper';
import { GameSessionService } from '../game-session/game-session.service';
import { MatchmakingService } from '../matchmaking/matchmaking.service';
import { PlayerSessionTrackerService } from '../players/player-session-tracker.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { WsAuthGuard } from 'src/shared/guards/ws-auth.guard';
import { BaseGateway } from 'src/gateways/base.gateway';
import { AuthenticationRepository } from 'src/authentication/repositories/authentication.repository';
import { RedisService } from 'src/shared/services/redis.service';
import { JwtService } from '@nestjs/jwt';
import { UserDto } from 'src/shared/dtos/user.dto';
import { WsValidationPipe } from 'src/shared/pipes/ws-validation.pipe';
import { WsUser } from 'src/shared/decorators/ws-user.decorator';
import { GameSessionDocument } from '../game-session/game-session.service';
import {
  DbGameSchema,
  GameGatewaySocketEvent,
  MultiplayerGameEmitterEvent,
  QuickMatchResponseStatus,
} from '@blockwinz/shared';
import { WsExceptionFilter } from 'src/shared/filters/ws-exception.filter';
import { WsExceptionWithCode } from 'src/shared/filters/ws-exception-with-code';
import { WsResponse } from 'src/shared/helpers/wsResponse.helper';
import { SOCKET_IO_CORS } from 'src/shared/constants/cors-origins.constant';
import { DisconnectionListener } from '../players/listeners/disconnection.listener';
import type { JoinGameOptions } from '../game-session/game-session.service';

@UseFilters(new WsExceptionFilter())
@WebSocketGateway({ namespace: 'game', cors: SOCKET_IO_CORS })
@UseGuards(WsAuthGuard)
export class GameGateway extends BaseGateway {
  @WebSocketServer()
  server: Server;
  protected readonly logger = new Logger(GameGateway.name);

  constructor(
    private readonly gameSessionService: GameSessionService,
    private readonly matchmakingService: MatchmakingService,
    private readonly playerSessionTracker: PlayerSessionTrackerService,
    private readonly disconnectionListener: DisconnectionListener,
    protected readonly eventEmitter: EventEmitter2,
    protected jwtService: JwtService,
    protected readonly redisService: RedisService,
    protected readonly authenticationRepository: AuthenticationRepository,
  ) {
    super(jwtService, redisService, authenticationRepository, eventEmitter);
    // Listen to internal events and broadcast to rooms
    this.eventEmitter.on(MultiplayerGameEmitterEvent.GAME_STARTED, (payload) => {
      this.server
        .to(`room:${payload.sessionId}`)
        .emit(MultiplayerGameEmitterEvent.GAME_STARTED, payload);
    });
    this.eventEmitter.on(MultiplayerGameEmitterEvent.GAME_MOVE, (payload) => {
      this.server
        .to(`room:${payload.sessionId}`)
        .emit(MultiplayerGameEmitterEvent.GAME_MOVE, payload);
    });
    this.eventEmitter.on(
      MultiplayerGameEmitterEvent.GAME_INVALID_MOVE,
      (payload) => {
        this.server
          .to(`room:${payload.sessionId}`)
          .emit(MultiplayerGameEmitterEvent.GAME_INVALID_MOVE, payload);
      },
    );
    this.eventEmitter.on(MultiplayerGameEmitterEvent.GAME_FINISHED, (payload) => {
      this.server
        .to(`room:${payload.sessionId}`)
        .emit(MultiplayerGameEmitterEvent.GAME_FINISHED, payload);
    });
    this.eventEmitter.on(MultiplayerGameEmitterEvent.PLAYER_AFK, (payload) => {
      this.server
        .to(`room:${payload.sessionId}`)
        .emit(MultiplayerGameEmitterEvent.PLAYER_AFK, payload);
    });
    this.eventEmitter.on(
      MultiplayerGameEmitterEvent.PLAYER_DISCONNECTED,
      (payload) => {
        this.server
          .to(`room:${payload.sessionId}`)
          .emit(MultiplayerGameEmitterEvent.PLAYER_DISCONNECTED, payload);
      },
    );
    this.eventEmitter.on(
      MultiplayerGameEmitterEvent.LOBBY_UPDATED,
      (payload: {
        gameType: DbGameSchema;
        reason: string;
        sessionId?: string;
        session: unknown;
      }) => {
        this.server
          .to(`lobbies:${payload.gameType}`)
          .emit(MultiplayerGameEmitterEvent.LOBBY_UPDATED, payload);
      },
    );
    this.eventEmitter.on(
      MultiplayerGameEmitterEvent.LOBBY_EXPIRED,
      (payload: { sessionId: string; gameType: DbGameSchema }) => {
        this.server
          .to(`lobbies:${payload.gameType}`)
          .emit(MultiplayerGameEmitterEvent.LOBBY_EXPIRED, payload);
      },
    );
    this.eventEmitter.on(
      MultiplayerGameEmitterEvent.MATCH_READY,
      (payload: {
        sessionId: string;
        gameType: string;
        playerIds: string[];
      }) => {
        void this.emitMatchReadyToPlayers(payload);
      },
    );
  }

  private async emitMatchReadyToPlayers(payload: {
    sessionId: string;
    gameType: string;
    playerIds: string[];
  }): Promise<void> {
    const data = {
      sessionId: payload.sessionId,
      gameType: payload.gameType,
    };
    for (const pid of payload.playerIds) {
      const sockets = await this.getUserSocketIds(pid);
      for (const sid of sockets) {
        this.emitToSocket(sid, MultiplayerGameEmitterEvent.MATCH_READY, data);
      }
    }
  }

  protected emitToSocket(socketId: string, event: string, data: any): void {
    try {
      this.server.to(socketId).emit(event, data);
      this.logger.debug(`Emitted ${event} to socket ${socketId}`);
    } catch (error) {
      this.logger.error(
        `Failed to emit ${event} to socket ${socketId}:`,
        error,
      );
    }
  }

  @SubscribeMessage(GameGatewaySocketEvent.GET_ACTIVE_GAME)
  async getActiveGame(
    @ConnectedSocket() client: Socket,
    @WsUser() user: UserDto,
    @MessageBody() data: { gameType: DbGameSchema },
  ) {
    try {
      const result = await this.gameSessionService.getActiveGame(
        user,
        data.gameType,
      );
      return WsResponse.success(result);
    } catch (error) {
      // Optionally still emit error event
      this.emitToSocket(
        client.id,
        GameGatewaySocketEvent.GAME_ERROR,
        new WsExceptionWithCode(error.message),
      );
      return error;
    }
  }

  @SubscribeMessage(GameGatewaySocketEvent.NEW_GAME)
  async newGame(
    @ConnectedSocket() client: Socket,
    @MessageBody(new WsValidationPipe()) payload: GameSessionDocument,
    @WsUser() user: UserDto,
  ) {
    try {
      const alreadyActive = await this.gameSessionService.getActiveGame(
        user,
        payload.gameType as DbGameSchema,
      );
      if (alreadyActive) {
        return WsResponse.success(alreadyActive);
      }
      const session = await this.gameSessionService.createSession(
        user,
        payload,
      );
      return WsResponse.success(session);
    } catch (error) {
      this.emitToSocket(client.id, GameGatewaySocketEvent.GAME_ERROR, {
        message: error.message,
      });
      return WsResponse.error(error.message);
    }
  }

  @SubscribeMessage(GameGatewaySocketEvent.GAME_ACTION)
  async gameAction(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { message?: string; action?: string; sessionId?: string; move?: unknown },
    @WsUser() user: UserDto,
  ) {
    try {
      const payload =
        typeof data?.message === 'string'
          ? data.message
          : (data as Record<string, unknown>);
      const result = await this.gameSessionService.handleGameAction(
        payload,
        user,
      );
      return WsResponse.success(result);
    } catch (error) {
      this.emitToSocket(client.id, GameGatewaySocketEvent.GAME_ERROR, {
        message: error.message,
      });
      throw error;
    }
  }

  @SubscribeMessage(GameGatewaySocketEvent.QUICK_MATCH)
  async quickMatch(
    @ConnectedSocket() client: Socket,
    @MessageBody(new WsValidationPipe())
    data: { gameId: DbGameSchema; betAmount: number; currency: string },
    @WsUser() user: UserDto,
  ) {
    try {
      const outcome = await this.gameSessionService.tryJoinOrEnqueueQuickMatch(
        user,
        {
          gameId: data.gameId,
          betAmount: data.betAmount,
          currency: data.currency,
        },
        () =>
          this.matchmakingService.requestMatch({
            userId: getUserId(user),
            gameId: data.gameId,
            betAmount: data.betAmount,
            currency: data.currency,
            mode: 'RANDOM_PUBLIC',
          }),
      );
      if (outcome.kind === 'joined') {
        return WsResponse.success({
          status: QuickMatchResponseStatus.JOINED,
          session: outcome.session,
        });
      }
      return WsResponse.success({ status: outcome.status });
    } catch (error) {
      this.emitToSocket(client.id, GameGatewaySocketEvent.GAME_ERROR, {
        message: error.message,
      });
      return WsResponse.error(error.message);
    }
  }

  @SubscribeMessage(GameGatewaySocketEvent.LIST_PUBLIC_LOBBIES)
  async listPublicLobbies(
    @ConnectedSocket() client: Socket,
    @MessageBody(new WsValidationPipe()) data: { gameType: DbGameSchema },
  ) {
    try {
      const rows = await this.gameSessionService.listPublicLobbies(
        data.gameType,
      );
      return WsResponse.success(rows);
    } catch (error) {
      this.emitToSocket(client.id, GameGatewaySocketEvent.GAME_ERROR, {
        message: error.message,
      });
      return WsResponse.error(error.message);
    }
  }

  @SubscribeMessage(GameGatewaySocketEvent.JOIN_GAME)
  async joinGame(
    @ConnectedSocket() client: Socket,
    @MessageBody(new WsValidationPipe())
    data: {
      gameId: string;
      joinCode?: string;
      betAmount?: number;
      currency?: string;
    },
    @WsUser() user: UserDto,
  ) {
    try {
      const joinOpts: JoinGameOptions | undefined =
        data.betAmount !== undefined || data.currency !== undefined
          ? { betAmount: data.betAmount, currency: data.currency }
          : undefined;
      const session = data.joinCode
        ? await this.gameSessionService.joinGameWithCode(
            data.gameId,
            data.joinCode,
            user,
            joinOpts,
          )
        : await this.gameSessionService.joinGame(data.gameId, user, joinOpts);
      return WsResponse.success(session);
    } catch (error) {
      this.emitToSocket(client.id, GameGatewaySocketEvent.GAME_ERROR, {
        message: error.message,
      });
      throw error;
    }
  }

  @SubscribeMessage(GameGatewaySocketEvent.LEAVE_GAME)
  async leaveGame(
    @ConnectedSocket() client: Socket,
    @MessageBody(new WsValidationPipe()) data: { gameId: string },
    @WsUser() user: UserDto,
  ) {
    try {
      const session = await this.gameSessionService.leaveGame(
        data.gameId,
        user,
      );
      return WsResponse.success(session);
    } catch (error) {
      this.emitToSocket(client.id, GameGatewaySocketEvent.GAME_ERROR, {
        message: error.message,
      });
      throw error;
    }
  }

  /**
   * Joins the Socket.IO room for a session so `game.started`, `game.move`, and `game.finished` reach this client.
   */
  @SubscribeMessage(GameGatewaySocketEvent.JOIN_SESSION_ROOM)
  async joinSessionRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody(new WsValidationPipe()) data: { sessionId: string },
    @WsUser() user: UserDto,
  ) {
    try {
      const session = await this.gameSessionService.getSessionById(
        data.sessionId,
      );
      if (!session) {
        throw new WsExceptionWithCode('Session not found', 404);
      }
      const userId = getUserId(user);
      if (!session.players.map(String).includes(userId)) {
        throw new WsExceptionWithCode('Not a player in this session', 403);
      }
      const room = `room:${data.sessionId}`;
      await client.join(room);
      (client.data as { multiplayerSessionId?: string }).multiplayerSessionId =
        data.sessionId;
      this.playerSessionTracker.markConnected(userId, data.sessionId);
      this.disconnectionListener.clearTimeoutForPlayer(userId);
      await this.gameSessionService.clearReconnectGrace(data.sessionId);
      return WsResponse.success({ joined: true, sessionId: data.sessionId });
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Join session room failed';
      this.emitToSocket(client.id, GameGatewaySocketEvent.GAME_ERROR, {
        message: msg,
      });
      throw error;
    }
  }

  /**
   * Leaves the session Socket.IO room (e.g. UI navigated away) without ending the match.
   */
  @SubscribeMessage(GameGatewaySocketEvent.LEAVE_SESSION_ROOM)
  async leaveSessionRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody(new WsValidationPipe()) data: { sessionId: string },
  ) {
    try {
      const room = `room:${data.sessionId}`;
      await client.leave(room);
      delete (client.data as { multiplayerSessionId?: string })
        .multiplayerSessionId;
      return WsResponse.success({ left: true, sessionId: data.sessionId });
    } catch (error) {
      this.emitToSocket(client.id, GameGatewaySocketEvent.GAME_ERROR, {
        message: (error as Error).message,
      });
      return WsResponse.error((error as Error).message);
    }
  }

  @SubscribeMessage(GameGatewaySocketEvent.JOIN_LOBBY_ROOM)
  async joinLobbyRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody(new WsValidationPipe()) data: { gameType: DbGameSchema },
  ) {
    try {
      await client.join(`lobbies:${data.gameType}`);
      return WsResponse.success({ joined: true, gameType: data.gameType });
    } catch (error) {
      this.emitToSocket(client.id, GameGatewaySocketEvent.GAME_ERROR, {
        message: (error as Error).message,
      });
      return WsResponse.error((error as Error).message);
    }
  }

  @SubscribeMessage(GameGatewaySocketEvent.LEAVE_LOBBY_ROOM)
  async leaveLobbyRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody(new WsValidationPipe()) data: { gameType: DbGameSchema },
  ) {
    try {
      await client.leave(`lobbies:${data.gameType}`);
      return WsResponse.success({ left: true, gameType: data.gameType });
    } catch (error) {
      this.emitToSocket(client.id, GameGatewaySocketEvent.GAME_ERROR, {
        message: (error as Error).message,
      });
      return WsResponse.error((error as Error).message);
    }
  }

  @SubscribeMessage(GameGatewaySocketEvent.JOIN_SPECTATOR_SESSION)
  async joinSpectatorSession(
    @ConnectedSocket() client: Socket,
    @MessageBody(new WsValidationPipe()) data: { sessionId: string },
    @WsUser() user: UserDto,
  ) {
    try {
      const session = await this.gameSessionService.getSessionById(
        data.sessionId,
      );
      if (!session) {
        throw new WsExceptionWithCode('Session not found', 404);
      }
      const userId = getUserId(user);
      const allowed =
        session.spectatorsAllowed ||
        session.spectatorUserIds.map(String).includes(userId);
      if (!allowed) {
        throw new WsExceptionWithCode('Spectating not allowed for this session', 403);
      }
      if (session.players.map(String).includes(userId)) {
        throw new WsExceptionWithCode('Use joinSessionRoom as a player', 400);
      }
      const room = `room:${data.sessionId}`;
      await client.join(room);
      return WsResponse.success({ joined: true, sessionId: data.sessionId, spectator: true });
    } catch (error) {
      this.emitToSocket(client.id, GameGatewaySocketEvent.GAME_ERROR, {
        message: (error as Error).message,
      });
      throw error;
    }
  }

  async handleDisconnect(client: Socket) {
    try {
      const userId = client.data?.userId as string | undefined;
      await super.handleDisconnect(client);
      if (userId) {
        this.playerSessionTracker.markDisconnected(userId);
        await this.gameSessionService.handleUserDisconnect(userId);
      }
      this.gameSessionService.handleDisconnect(client.id);
    } catch (error) {
      this.logger.error('Game gateway disconnect error', error);
    }
  }
}
