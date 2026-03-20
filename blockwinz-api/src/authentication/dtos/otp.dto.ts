import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsBoolean,
  IsDate,
  IsOptional,
} from '@nestjs/class-validator';

export class OtpDto {
  @ApiPropertyOptional()
  _id?: string;

  @ApiProperty()
  @IsString()
  email: string;

  @ApiProperty()
  @IsString()
  otp: string;

  @ApiProperty()
  @IsDate()
  expiresAt: Date;

  @ApiProperty()
  @IsBoolean()
  isUsed: boolean;

  @ApiPropertyOptional()
  @IsDate()
  @IsOptional()
  createdAt?: Date;

  @ApiPropertyOptional()
  @IsDate()
  @IsOptional()
  updatedAt?: Date;
}
