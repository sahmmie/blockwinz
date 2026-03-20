import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsBoolean,
  IsEnum,
  IsOptional,
  IsArray,
  IsDate,
  IsNumber,
  ValidateNested,
} from '@nestjs/class-validator';
import { RoomType } from 'src/shared/enums/roomType.enum';
import { Type } from 'class-transformer';

export class RoomDto {
  @ApiPropertyOptional()
  _id?: string;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsBoolean()
  isActive: boolean;

  @ApiProperty()
  @IsBoolean()
  isPrivate: boolean;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  createdBy?: string;

  @ApiProperty()
  @IsEnum(RoomType)
  roomType: RoomType;

  @ApiProperty({ type: [Object] })
  @IsArray()
  members: Array<{
    user: string;
    canSend: boolean;
    isViewer: boolean;
    joinedAt: Date;
  }>;

  @ApiPropertyOptional()
  @IsDate()
  @IsOptional()
  createdAt?: Date;

  @ApiPropertyOptional()
  @IsDate()
  @IsOptional()
  updatedAt?: Date;
}

class RoomMemberDto {
  @IsString()
  user: string;

  @IsBoolean()
  @IsOptional()
  canSend?: boolean = true;

  @IsBoolean()
  @IsOptional()
  isViewer?: boolean = false;
}

export class CreateRoomDto {
  @IsString()
  @IsOptional()
  name: string;

  @IsBoolean()
  @IsOptional()
  isPrivate?: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RoomMemberDto)
  members: RoomMemberDto[];
}

export class UpdateRoomDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsBoolean()
  @IsOptional()
  isPrivate?: boolean;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class AddRoomMemberDto {
  @IsString()
  userId: string;

  @IsBoolean()
  @IsOptional()
  canSend?: boolean = true;

  @IsBoolean()
  @IsOptional()
  isViewer?: boolean = false;
}

export class RoomInfo {
  _id: string;

  @IsString()
  name: string;

  @IsNumber()
  @IsOptional()
  membersCount?: number;

  @IsBoolean()
  @IsOptional()
  isPrivate?: boolean;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsBoolean()
  @IsOptional()
  canSend?: boolean;

  @IsNumber()
  @IsOptional()
  onlineMembersCount?: number;

  @IsBoolean()
  @IsOptional()
  isViewer?: boolean;
}
