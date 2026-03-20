import { DbSchema } from 'src/shared/enums/dbSchema.enum';
import { WsException } from '@nestjs/websockets';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { UserDto } from 'src/shared/dtos/user.dto';
import { SendMessageDto, MessageDto } from '../dtos/message.dto';
import { Profanity } from '@2toad/profanity';
import { RoomDto } from '../dtos/room.dto';
import { DRIZZLE } from 'src/database/constants';
import type { DrizzleDb } from 'src/database/database.module';
import { messages } from 'src/database/schema/messages';
import { rooms } from 'src/database/schema/rooms';
import { eq, desc } from 'drizzle-orm';
import type {
  MessageSelect,
  MessageInsert,
} from 'src/database/schema/messages';
import type { RoomSelect, RoomInsert } from 'src/database/schema/rooms';
import { RoomType } from 'src/shared/enums/roomType.enum';
import { getUserId } from 'src/shared/helpers/user.helper';

type RoomMember = {
  userId: string;
  canSend: boolean;
  isViewer: boolean;
  joinedAt: string;
};

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);
  private readonly profanity = new Profanity({
    languages: ['en'],
    wholeWord: false,
    grawlix: '*****',
    grawlixChar: '$',
  });

  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDb) {}

  /**
   * Creates a new message in the specified room.
   */
  async createMessage(payload: {
    userId: string;
    username: string;
    roomId: string;
    roomName: string;
    content: string;
    timestamp?: Date;
  }): Promise<MessageDto> {
    const [row] = await this.db
      .insert(messages)
      .values({
        userId: payload.userId,
        username: payload.username,
        roomId: payload.roomId,
        roomName: payload.roomName,
        content: payload.content,
        timestamp: payload.timestamp ?? new Date(),
      } as MessageInsert)
      .returning();
    if (!row) throw new Error('Failed to create message');
    return this.messageRowToDto(row);
  }

  processMessage(
    user: UserDto,
    data: SendMessageDto,
    roomId: string,
  ): {
    userId: string;
    username: string;
    roomId: string;
    roomName: string;
    content: string;
    timestamp: Date;
  } {
    const hasProfanity = this.profanity.exists(data.content);
    if (hasProfanity) {
      throw new WsException('Message contains restricted words');
    }
    const userId = getUserId(user);
    return {
      userId,
      username: user.username,
      roomId,
      roomName: data.roomName,
      content: data.content,
      timestamp: new Date(),
    };
  }

  async getMessages(
    roomName: string,
    limit: number,
    page: number,
  ): Promise<MessageDto[]> {
    const limitVal = limit || 50;
    const offset = (page - 1) * limitVal;
    const rows = await this.db
      .select()
      .from(messages)
      .where(eq(messages.roomName, roomName))
      .orderBy(desc(messages.timestamp))
      .limit(limitVal)
      .offset(offset);
    return rows.map((r) => this.messageRowToDto(r));
  }

  async createRoom(user: UserDto, room: RoomDto): Promise<RoomDto> {
    const userId = getUserId(user);
    const existingMembers = (room.members ?? []) as Array<{
      user?: unknown;
      userId?: string;
    }>;
    const memberExists = existingMembers.some(
      (m) => String(m.user ?? m.userId) === userId,
    );
    const members: RoomMember[] = memberExists
      ? (room.members as unknown as RoomMember[])
      : [
          ...(room.members as unknown as RoomMember[]),
          {
            userId,
            canSend: true,
            isViewer: false,
            joinedAt: new Date().toISOString(),
          },
        ];

    const [row] = await this.db
      .insert(rooms)
      .values({
        name: room.name.toLowerCase(),
        createdById: userId,
        isPrivate: room.isPrivate ?? false,
        isActive: room.isActive ?? true,
        roomType: (room as { roomType?: string }).roomType ?? 'chat',
        members,
      } as RoomInsert)
      .returning();
    if (!row) throw new Error('Failed to create room');
    return this.roomRowToDto(row);
  }

  async getRoomInfo(roomName: string): Promise<RoomDto> {
    const [row] = await this.db
      .select()
      .from(rooms)
      .where(eq(rooms.name, roomName.toLowerCase()))
      .limit(1);
    if (!row) {
      throw new Error('Room not found');
    }
    return this.roomRowToDto(row);
  }

  async getUserRooms(userId: string): Promise<RoomDto[]> {
    const rows = await this.db.select().from(rooms);
    const filtered = rows.filter((r) => {
      const membersList = (r.members ?? []) as RoomMember[];
      return membersList.some((m) => m.userId === userId);
    });
    return filtered.map((r) => this.roomRowToDto(r));
  }

  async addRoomMember(
    roomName: string,
    userId: string,
    canSend: boolean,
    isViewer: boolean,
  ): Promise<RoomDto> {
    const [row] = await this.db
      .select()
      .from(rooms)
      .where(eq(rooms.name, roomName.toLowerCase()))
      .limit(1);
    if (!row) throw new Error('Room not found');
    const membersList = (row.members ?? []) as RoomMember[];
    const memberExists = membersList.some((m) => m.userId === userId);
    if (memberExists) return this.roomRowToDto(row);
    if (!row.isActive) throw new Error('Room is not active');
    const newMembers: RoomMember[] = [
      ...membersList,
      { userId, canSend, isViewer, joinedAt: new Date().toISOString() },
    ];
    await this.db
      .update(rooms)
      .set({
        members: newMembers,
        updatedAt: new Date(),
      } as Partial<RoomSelect>)
      .where(eq(rooms.id, row.id));
    const [updated] = await this.db
      .select()
      .from(rooms)
      .where(eq(rooms.id, row.id))
      .limit(1);
    return updated
      ? this.roomRowToDto(updated)
      : this.roomRowToDto({ ...row, members: newMembers });
  }

  async removeRoomMember(roomName: string, userId: string): Promise<RoomDto> {
    const [row] = await this.db
      .select()
      .from(rooms)
      .where(eq(rooms.name, roomName.toLowerCase()))
      .limit(1);
    if (!row) throw new Error('Room not found');
    const membersList = (row.members ?? []) as RoomMember[];
    const memberIndex = membersList.findIndex((m) => m.userId === userId);
    if (memberIndex === -1) throw new Error('Member not found');
    const newMembers = [...membersList];
    newMembers.splice(memberIndex, 1);
    await this.db
      .update(rooms)
      .set({
        members: newMembers,
        updatedAt: new Date(),
      } as Partial<RoomSelect>)
      .where(eq(rooms.id, row.id));
    const [updated] = await this.db
      .select()
      .from(rooms)
      .where(eq(rooms.id, row.id))
      .limit(1);
    return updated
      ? this.roomRowToDto(updated)
      : this.roomRowToDto({ ...row, members: newMembers });
  }

  private messageRowToDto(row: MessageSelect): MessageDto {
    return {
      _id: row.id,
      userId: row.userId as unknown as MessageDto['userId'],
      username: row.username,
      roomId: row.roomId as unknown as MessageDto['roomId'],
      roomName: row.roomName,
      content: row.content,
      timestamp: row.timestamp ?? new Date(),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  private roomRowToDto(
    row: RoomSelect | (RoomSelect & { members: RoomMember[] }),
  ): RoomDto {
    const membersList = (row.members ?? []) as RoomMember[];
    return {
      _id: row.id,
      name: row.name,
      isActive: row.isActive ?? true,
      isPrivate: row.isPrivate ?? false,
      createdBy: row.createdById as unknown as RoomDto['createdBy'],
      roomType:
        ((row as { roomType?: string }).roomType as RoomType) ?? RoomType.CHAT,
      members: membersList.map((m) => ({
        user: m.userId as unknown as RoomDto['members'][0]['user'],
        canSend: m.canSend,
        isViewer: m.isViewer,
        joinedAt: new Date(m.joinedAt),
      })),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}
