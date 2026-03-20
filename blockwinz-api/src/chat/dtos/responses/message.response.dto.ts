import { Expose, Transform } from 'class-transformer';

export class MessageResponseDto {
  @Expose({ name: '_id' })
  @Transform(({ obj }) => obj._id?.toString())
  id: string;

  @Expose()
  @Transform(({ obj }) => obj.userId?.toString())
  userId: string;

  @Expose()
  username: string;

  @Expose({ name: 'roomId' })
  @Transform(({ obj }) => obj.roomId?.toString())
  roomId: string;

  @Expose()
  roomName: string;

  @Expose()
  content: string;

  @Expose()
  timestamp: Date;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
