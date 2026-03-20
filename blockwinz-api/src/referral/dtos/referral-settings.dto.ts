import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsDate,
  Min,
  Max,
} from '@nestjs/class-validator';

export class ReferralSettingsDto {
  @ApiPropertyOptional()
  _id?: string;

  @ApiProperty()
  @IsNumber()
  minimumDepositAmount: number;

  @ApiProperty()
  @IsNumber()
  rewardPercentage: number;

  @ApiProperty()
  @IsNumber()
  maxReferralsPerUser: number;

  @ApiProperty()
  @IsNumber()
  referralCompletionTimeframe: number;

  @ApiProperty()
  @IsString()
  referralCodePrefix: string;

  @ApiProperty()
  @IsNumber()
  referralCodeLength: number;

  @ApiProperty()
  @IsBoolean()
  isActive: boolean;

  @ApiPropertyOptional()
  @IsDate()
  @IsOptional()
  createdAt?: Date;

  @ApiPropertyOptional()
  @IsDate()
  @IsOptional()
  updatedAt?: Date;
}

export class UpdateReferralSettingsDto {
  @ApiPropertyOptional()
  @IsNumber()
  @Min(0)
  @IsOptional()
  minimumDepositAmount?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  rewardPercentage?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @Min(0)
  @IsOptional()
  maxReferralsPerUser?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @Min(1)
  @IsOptional()
  referralCompletionTimeframe?: number;

  @ApiPropertyOptional()
  @IsString()
  @Max(5)
  @IsOptional()
  referralCodePrefix?: string;

  @ApiPropertyOptional()
  @IsNumber()
  @Min(6)
  @Max(12)
  @IsOptional()
  referralCodeLength?: number;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
