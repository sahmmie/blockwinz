import { IsBoolean, IsString, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/** Profile DTO. Prefer `id` (UUID) over `_id` when reading the profile identifier. */
export class ProfileDto {
  @ApiPropertyOptional() @IsString() id?: string;
  @ApiPropertyOptional() @IsString() _id?: string;
  @ApiProperty() @IsString() user: string;
  @ApiPropertyOptional() @IsBoolean() isHotKeysActive: boolean;
  @ApiPropertyOptional() @IsBoolean() canWithdraw: boolean;
  @ApiPropertyOptional() @IsBoolean() isMuted: boolean;
  @ApiPropertyOptional() @IsBoolean() isBanned: boolean;
  @ApiPropertyOptional() @IsBoolean() isTurbo: boolean;
  @ApiPropertyOptional() @IsString() referralCode?: string;
  @ApiPropertyOptional() @IsString() referredBy?: string;
  @ApiPropertyOptional() @IsNumber() referralCount?: number;
  @ApiPropertyOptional() @IsNumber() referralEarnings?: number;
}
