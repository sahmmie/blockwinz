import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsDate,
  IsEmail,
  IsEnum,
  IsNumber,
  IsString,
  Length,
  Matches,
  IsOptional,
} from '@nestjs/class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserAccountEnum } from '../enums/userAccount.enums';
import { SeedDto } from 'src/core/seeds /dtos/seeds.dto';
import { ProfileDto } from './profile.dto';

/**
 * User data transfer object. Used for API responses and request user (UserRequestI).
 * Primary identifier is `id` (UUID from Postgres). `_id` is kept for backward compatibility.
 */
export class UserDto {
  /** Primary user identifier (UUID). Prefer this over _id. */
  @ApiPropertyOptional() @IsString() id?: string;
  /** Legacy identifier alias. Use `id` when possible. */
  @ApiPropertyOptional() @IsString() _id?: string;
  @ApiPropertyOptional() @IsNumber() __v?: number;
  @ApiProperty() @IsEmail() email: string;
  @ApiProperty() @IsString() password: string;
  @ApiProperty({
    enum: UserAccountEnum,
    isArray: true,
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsEnum(UserAccountEnum, { each: true })
  userAccounts: UserAccountEnum[];
  @ApiPropertyOptional() @IsString() profile?: string | ProfileDto;
  @ApiPropertyOptional()
  @IsString()
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message:
      'Username can only contain alphanumeric characters and underscores.',
  })
  @Length(4, 20, {
    message: 'Username must be between 4 and 20 characters long.',
  })
  username: string;
  @ApiPropertyOptional() @IsDate() lastLogin?: Date;
  @ApiPropertyOptional() @IsDate() lastLogout?: Date;
  @ApiPropertyOptional() @IsBoolean() faEnabled?: boolean;

  @ApiPropertyOptional() @IsNumber() nonce?: number;
  @ApiPropertyOptional() @IsString() futureClientSeed?: string;
  @ApiPropertyOptional() @IsString() futureServerSeed?: string;
  @ApiPropertyOptional() @IsString() futureServerSeedHash?: string;

  @ApiPropertyOptional() @IsString() activeSeed?: string | SeedDto;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  emailVerified?: boolean;

  @ApiPropertyOptional({
    description: 'Referral code used during registration',
  })
  @IsString()
  @IsOptional()
  referralCode?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  emailVerificationToken?: string;

  @ApiPropertyOptional()
  @IsDate()
  @IsOptional()
  emailVerificationTokenExpires?: Date;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  emailVerificationResendCount?: number;
}

export class LoginDto {
  @ApiProperty() @IsString() password: string;
  @ApiProperty() @IsString() username: string;
}

export class ChangeEmailDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'New email address',
  })
  @IsEmail()
  email: string;
}
