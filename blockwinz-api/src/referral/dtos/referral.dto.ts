import {
  IsString,
  IsOptional,
  IsNumber,
  IsEnum,
  IsDate,
  IsArray,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ReferralStatus } from './referral-tracking.dto';

export class ReferralResponseDto {
  @ApiProperty({
    description: "The user's unique referral code",
    example: 'ABC123XY',
  })
  @IsString()
  referralCode: string;

  @ApiProperty({
    description: 'Number of successful referrals',
    example: 5,
  })
  @IsNumber()
  referralCount: number;

  @ApiProperty({
    description: 'Total earnings from referrals',
    example: 100.5,
  })
  @IsNumber()
  referralEarnings: number;
}

export class ReferralStatsDto {
  @ApiProperty({
    description: 'Total number of referrals',
    example: 10,
  })
  @IsNumber()
  totalReferrals: number;

  @ApiProperty({
    description: 'Number of active referrals',
    example: 3,
  })
  @IsNumber()
  activeReferrals: number;

  @ApiProperty({
    description: 'Total earnings from all referrals',
    example: 250.75,
  })
  @IsNumber()
  totalEarnings: number;
}

export class UpdateReferralStatusDto {
  @ApiProperty({
    description: 'New status for the referral',
    enum: ReferralStatus,
    example: ReferralStatus.COMPLETED,
  })
  @IsEnum(ReferralStatus)
  status: ReferralStatus;

  @ApiProperty({
    description: 'Reward amount to be given for the referral',
    required: false,
    example: 50.25,
  })
  @IsOptional()
  @IsNumber()
  rewardAmount?: number;
}

// New DTO for schema type definition
export class ReferralDto {
  @ApiPropertyOptional()
  _id?: string;

  @ApiProperty()
  @IsString()
  referrer: string;

  @ApiProperty()
  @IsString()
  referred: string;

  @ApiProperty()
  @IsEnum(ReferralStatus)
  status: ReferralStatus;

  @ApiProperty()
  @IsNumber()
  rewardAmount: number;

  @ApiProperty()
  conditions: {
    minimumDeposit: number;
    minimumBets: number;
    timeframe: number;
  };

  @ApiProperty()
  progress: {
    totalDeposits: number;
    totalBets: number;
    lastActivity: Date;
  };

  @ApiProperty({ type: [Object] })
  @IsArray()
  history: Array<{
    status: ReferralStatus;
    timestamp: Date;
    reason?: string;
    details?: any;
  }>;

  @ApiPropertyOptional()
  @IsDate()
  @IsOptional()
  completedAt?: Date;

  @ApiProperty()
  @IsDate()
  expiresAt: Date;

  @ApiPropertyOptional()
  @IsDate()
  @IsOptional()
  createdAt?: Date;

  @ApiPropertyOptional()
  @IsDate()
  @IsOptional()
  updatedAt?: Date;
}
