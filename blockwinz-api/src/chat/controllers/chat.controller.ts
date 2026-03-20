import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
} from '@nestjs/websockets';
import { UseGuards } from '@nestjs/common';
import { Socket, Server } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ChatService } from '../services/chat.service';
import { BaseGateway } from '../../gateways/base.gateway';
import { SendMessageDto } from '../dtos/message.dto';
import { MessageResponseDto } from '../dtos/responses/message.response.dto';
import { plainToInstance } from 'class-transformer';
import { RoomDto, RoomInfo } from '../dtos/room.dto';
import { WsAuthGuard } from 'src/shared/guards/ws-auth.guard';
import { RedisService } from 'src/shared/services/redis.service';
import { UserDto } from 'src/shared/dtos/user.dto';
import { WsUser } from 'src/shared/decorators/ws-user.decorator';
import { RedisKey } from 'src/shared/enums/redisKey.enum';
import { WsValidationPipe } from 'src/shared/pipes/ws-validation.pipe';
import { AuthenticationRepository } from 'src/authentication/repositories/authentication.repository';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { getUserId, getRoomId } from 'src/shared/helpers/user.helper';

@WebSocketGateway({ namespace: 'chat', cors: { origin: '*' } })
@UseGuards(WsAuthGuard)
export class ChatGateway extends BaseGateway {
  @WebSocketServer()
  server: Server;

  private readonly GENERAL_ROOM_NAME = 'general';

  constructor(
    protected jwtService: JwtService,
    protected readonly redisService: RedisService,
    protected readonly authenticationRepository: AuthenticationRepository,
    private chatService: ChatService,
    protected eventEmitter: EventEmitter2,
  ) {
    super(jwtService, redisService, authenticationRepository, eventEmitter);
  }

  async handleConnection(client: Socket) {
    try {
      // Call parent's handleConnection first
      await super.handleConnection(client);

      // Handle chat-specific connection logic
      const user: UserDto = client.data.user;
      if (!user) return;

      // Find general room
      let generalRoom = await this.chatService.getRoomInfo(
        this.GENERAL_ROOM_NAME,
      );
      if (!generalRoom) {
        throw new Error('General room not found');
      }

      // Check if user is already a member
      const isMember = generalRoom.members.some(
        (member) => member.user.toString() === getUserId(user),
      );

      if (!isMember) {
        const userId = getUserId(user);
        generalRoom = await this.chatService.addRoomMember(
          generalRoom.name,
          userId,
          true,
          false,
        );
      }

      // Join the room socket
      await client.join(`chat:${generalRoom.name}`);
      this.logger.log(`User ${user.username} joined general room`);

      this.server
        .to(`chat:${generalRoom.name}`)
        .emit('roomInfo', await this.getRoomInfo(generalRoom));
      return this.getRoomInfo(generalRoom, user);
    } catch (error) {
      console.error('Error handling chat connection:', error);
      throw error;
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

  async handleDisconnect(client: Socket) {
    try {
      this.logger.log('Client disconnected:', client.data.user?.username);

      // Call parent's handleDisconnect first to clean up online users
      await super.handleDisconnect(client);

      const generalRoom = await this.chatService.getRoomInfo(
        this.GENERAL_ROOM_NAME,
      );
      if (generalRoom) {
        const roomInfo = await this.getRoomInfo(generalRoom);
        this.logger.log(
          `Emitting room info after disconnect. Online users: ${roomInfo.onlineMembersCount}`,
        );
        this.server.to(`chat:${generalRoom.name}`).emit('roomInfo', roomInfo);
      }
    } catch (error) {
      console.error('Error handling chat disconnect:', error);
    }
  }

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody(new WsValidationPipe()) data: { room: string },
    @WsUser() user: UserDto,
  ) {
    try {
      const room = await this.chatService.addRoomMember(
        data.room,
        getUserId(user),
        true,
        false,
      );
      await client.join(`chat:${room.name}`);
      const roomInfo = await this.getRoomInfo(room, user);
      client.to(`chat:${room.name}`).emit('roomInfo', roomInfo);
      return roomInfo;
    } catch (error) {
      client.emit('error', { message: error.message });
      throw error;
    }
  }

  @SubscribeMessage('getRoomInfo')
  async handleGetRoomInfo(
    @ConnectedSocket() client: Socket,
    @MessageBody(new WsValidationPipe()) data: { room: string },
  ) {
    try {
      const room = await this.chatService.getRoomInfo(data.room);
      return await this.getRoomInfo(room, client.data.user);
    } catch (error) {
      client.emit('error', { message: error.message });
      throw error;
    }
  }

  @SubscribeMessage('getRoomPreviousMessages')
  async handleGetRoomPreviousMessages(
    @ConnectedSocket() client: Socket,
    @MessageBody(new WsValidationPipe())
    data: { room: string; query: { page: number; limit: number } },
  ) {
    try {
      const room = await this.chatService.getRoomInfo(data.room);
      const isMember = room.members.find(
        (mem) => mem.user.toString() === getUserId(client.data.user),
      );
      if (!isMember) {
        throw new Error('You are not a member of this room');
      }
      const roomPreviousMessages = await this.chatService.getMessages(
        data.room,
        data.query.limit,
        data.query.page,
      );
      return roomPreviousMessages;
    } catch (error) {
      client.emit('error', { message: error.message });
      throw error;
    }
  }

  @SubscribeMessage('getUserRooms')
  async handleGetUserRooms(@ConnectedSocket() client: Socket) {
    try {
      const allUserRooms = await this.chatService.getUserRooms(
        getUserId(client.data.user),
      );
      const rooms = await Promise.all(
        allUserRooms.map((room) => this.getRoomInfo(room, client.data.user)),
      );
      return rooms;
    } catch (error) {
      client.emit('error', { message: error.message });
      throw error;
    }
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody(new WsValidationPipe()) data: SendMessageDto,
    @WsUser() user: UserDto,
  ) {
    try {
      // check if room is active
      const room = await this.chatService.getRoomInfo(data.roomName);
      if (!room.isActive) {
        throw new Error('Room is not active');
      }

      // Check if user is in room
      const isMember = room.members.find(
        (mem) => mem.user.toString() === getUserId(user),
      );
      if (!isMember) {
        throw new Error('You are not a member of this room');
      }

      // check if user can send message
      if (!isMember.canSend) {
        throw new Error('You are not allowed to send messages in this room');
      }
      const messagePayload = this.chatService.processMessage(
        user,
        data,
        getRoomId(room),
      );

      const savedMessage = await this.chatService.createMessage(messagePayload);

      const messageResponse = plainToInstance(
        MessageResponseDto,
        savedMessage,
        {
          excludeExtraneousValues: true,
        },
      );

      this.server
        .to(`chat:${data.roomName}`)
        .emit('newMessage', messageResponse);
      return messageResponse;
    } catch (error) {
      client.emit('messageError', {
        message: error.message,
        alert: true,
        code: 512,
      });
      client.emit('error', { message: error.message, alert: false, code: 512 });
      this.logger.error(error);
    }
  }

  private async getRoomInfo(room: RoomDto, user?: UserDto): Promise<RoomInfo> {
    const onlineUsers = await this.redisService.sMembers(RedisKey.ONLINE_USERS);
    const onlineRoomMembers = room.members.filter((mem) =>
      onlineUsers.includes(mem.user.toString()),
    );

    const roomInfo: RoomInfo = {
      _id: getRoomId(room),
      name: room.name,
      isPrivate: room.isPrivate,
      isActive: room.isActive,
      membersCount: room.members.length,
      onlineMembersCount: onlineRoomMembers.length,
    };
    if (user) {
      roomInfo.isViewer = room.members.find(
        (mem) => mem.user.toString() === getUserId(user),
      )?.isViewer;
      roomInfo.canSend = room.members.find(
        (mem) => mem.user.toString() === getUserId(user),
      )?.canSend;
    }
    return roomInfo;
  }

  protected getSocketById(socketId: string): Socket | null {
    try {
      return this.server.sockets.sockets.get(socketId) || null;
    } catch (error) {
      this.logger.error(`Failed to get socket by ID ${socketId}:`, error);
      return null;
    }
  }
}
