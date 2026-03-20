import { Expose, Type } from 'class-transformer';

export class RoomMemberResponseDto {
  @Expose()
  userId: string;

  @Expose()
  canSend: boolean;

  @Expose()
  isViewer: boolean;
}

export class RoomResponseDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  isPrivate: boolean;

  @Expose()
  isActive: boolean;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  @Type(() => RoomMemberResponseDto)
  members: RoomMemberResponseDto[];
}
