import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsDate, IsOptional } from '@nestjs/class-validator';

export class SendMessageDto {
  @IsString()
  roomName: string;

  @IsString()
  content: string;
}

export class JoinRoomDto {
  @IsString()
  roomName: string;
}

export class LeaveRoomDto {
  @IsString()
  roomName: string;
}

// New DTO for schema type definition
export class MessageDto {
  @ApiPropertyOptional()
  _id?: string;

  @ApiProperty()
  @IsString()
  userId: string;

  @ApiProperty()
  @IsString()
  username: string;

  @ApiProperty()
  @IsString()
  roomId: string;

  @ApiProperty()
  @IsString()
  roomName: string;

  @ApiProperty()
  @IsString()
  content: string;

  @ApiProperty()
  @IsDate()
  timestamp: Date;

  @ApiPropertyOptional()
  @IsDate()
  @IsOptional()
  createdAt?: Date;

  @ApiPropertyOptional()
  @IsDate()
  @IsOptional()
  updatedAt?: Date;
}
