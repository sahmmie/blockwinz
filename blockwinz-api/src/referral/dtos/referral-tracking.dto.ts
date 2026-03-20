import {
  IsString,
  IsNumber,
  IsDate,
  IsEnum,
  IsOptional,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/** API / Swagger referral lifecycle (wire format). */
export enum ReferralTrackingStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
}

export class ReferralProgressDto {
  @ApiProperty()
  @IsNumber()
  totalDeposits: number;

  @ApiProperty()
  @IsNumber()
  totalBets: number;

  @ApiProperty()
  @IsDate()
  lastActivity: Date;
}

export class ReferralHistoryEntryDto {
  @ApiProperty()
  @IsEnum(ReferralTrackingStatus)
  status: ReferralTrackingStatus;

  @ApiProperty()
  @IsDate()
  timestamp: Date;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  reason?: string;

  @ApiPropertyOptional()
  @IsOptional()
  details?: any;
}

export class ReferralTrackingDto {
  @ApiProperty()
  @IsEnum(ReferralTrackingStatus)
  status: ReferralTrackingStatus;

  @ApiProperty()
  @IsNumber()
  rewardAmount: number;

  @ApiProperty()
  @IsNumber()
  minimumDeposit: number;

  @ApiProperty()
  @IsNumber()
  minimumBets: number;

  @ApiProperty()
  @IsNumber()
  timeframe: number;

  @ApiProperty()
  @ValidateNested()
  @Type(() => ReferralProgressDto)
  progress: ReferralProgressDto;

  @ApiProperty({ type: [ReferralHistoryEntryDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReferralHistoryEntryDto)
  history: ReferralHistoryEntryDto[];

  @ApiProperty()
  @IsDate()
  completedAt?: Date;

  @ApiProperty()
  @IsDate()
  expiresAt: Date;
}

export class ReferralStatsResponseDto {
  @ApiProperty()
  @IsNumber()
  totalReferrals: number;

  @ApiProperty()
  @IsNumber()
  activeReferrals: number;

  @ApiProperty()
  @IsNumber()
  completedReferrals: number;

  @ApiProperty()
  @IsNumber()
  totalEarnings: number;

  @ApiProperty()
  @IsNumber()
  successRate: number;

  @ApiProperty()
  @IsNumber()
  averageCompletionTime: number;
}
