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
import { GameGatewaySocketEvent } from './gameGatewaySocketEvent.enum';
import { GameSessionDocument } from '../game-session/game-session.service';
import { DbGameSchema } from '@blockwinz/shared';
import { WsExceptionFilter } from 'src/shared/filters/ws-exception.filter';
import { WsExceptionWithCode } from 'src/shared/filters/ws-exception-with-code';
import { WsResponse } from 'src/shared/helpers/wsResponse.helper';

@UseFilters(new WsExceptionFilter())
@WebSocketGateway({ namespace: 'game', cors: true })
@UseGuards(WsAuthGuard)
export class GameGateway extends BaseGateway {
  @WebSocketServer()
  server: Server;
  protected readonly logger = new Logger(GameGateway.name);

  constructor(
    private readonly gameSessionService: GameSessionService,
    private readonly matchmakingService: MatchmakingService,
    private readonly playerSessionTracker: PlayerSessionTrackerService,
    protected readonly eventEmitter: EventEmitter2,
    protected jwtService: JwtService,
    protected readonly redisService: RedisService,
    protected readonly authenticationRepository: AuthenticationRepository,
  ) {
    super(jwtService, redisService, authenticationRepository, eventEmitter);
    // Listen to internal events and broadcast to rooms
    this.eventEmitter.on('game.started', (payload) => {
      this.server.to(`room:${payload.sessionId}`).emit('game.started', payload);
    });
    this.eventEmitter.on('game.move', (payload) => {
      this.server.to(`room:${payload.sessionId}`).emit('game.move', payload);
    });
    this.eventEmitter.on('game.invalidMove', (payload) => {
      this.server
        .to(`room:${payload.sessionId}`)
        .emit('game.invalidMove', payload);
    });
    this.eventEmitter.on('game.finished', (payload) => {
      this.server
        .to(`room:${payload.sessionId}`)
        .emit('game.finished', payload);
    });
    this.eventEmitter.on('player.afk', (payload) => {
      this.server.to(`room:${payload.sessionId}`).emit('player.afk', payload);
    });
    this.eventEmitter.on('player.disconnected', (payload) => {
      this.server
        .to(`room:${payload.sessionId}`)
        .emit('player.disconnected', payload);
    });
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
    @MessageBody(new WsValidationPipe()) data: { message: string },
    @WsUser() user: UserDto,
  ) {
    try {
      const result = await this.gameSessionService.handleGameAction(
        data.message,
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
      const status = await this.matchmakingService.requestMatch({
        userId: getUserId(user),
        gameId: data.gameId,
        betAmount: data.betAmount,
        currency: data.currency,
        mode: 'RANDOM_PUBLIC',
      });
      return WsResponse.success({ status });
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
    data: { gameId: string; joinCode?: string },
    @WsUser() user: UserDto,
  ) {
    try {
      const session = data.joinCode
        ? await this.gameSessionService.joinGameWithCode(
            data.gameId,
            data.joinCode,
            user,
          )
        : await this.gameSessionService.joinGame(data.gameId, user);
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

  async handleDisconnect(client: Socket) {
    try {
      const userId = client.data?.userId as string | undefined;
      await super.handleDisconnect(client);
      if (userId) {
        await this.gameSessionService.handleUserDisconnect(userId);
      }
      this.gameSessionService.handleDisconnect(client.id);
    } catch (error) {
      this.logger.error('Game gateway disconnect error', error);
    }
  }
}
