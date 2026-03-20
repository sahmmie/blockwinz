import {
  IsString,
  IsNumber,
  IsEnum,
  IsDate,
  IsBoolean,
  IsOptional,
  IsArray,
  Min,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RewardType } from 'src/shared/enums/rewardType.enum';
import { RequiredTask } from 'src/shared/enums/requiredTask.enum';

export class CreateCouponDto {
  @ApiProperty({
    description: 'Unique coupon code that users will enter to claim the reward',
    example: 'WELCOME2024',
    minLength: 4,
    maxLength: 20,
  })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({
    description:
      'Amount of reward to be given to the user when they claim the coupon',
    example: 100,
    minimum: 0,
    type: Number,
  })
  @IsNumber()
  @Min(0)
  rewardAmount: number;

  @ApiProperty({
    description: 'Type of reward to be given to the user',
    enum: RewardType,
    example: RewardType.BONUS_BALANCE,
    enumName: 'RewardType',
  })
  @IsEnum(RewardType)
  rewardType: RewardType;

  @ApiProperty({
    description:
      'Date and time when the coupon will expire. After this date, users cannot claim the coupon.',
    example: '2024-12-31T23:59:59Z',
    type: Date,
  })
  @IsDate()
  @Type(() => Date)
  expiryDate: Date;

  @ApiProperty({
    description:
      'Maximum number of times this coupon can be redeemed by different users',
    example: 100,
    minimum: 1,
    required: false,
    type: Number,
  })
  @IsNumber()
  @Min(1)
  @IsOptional()
  maxRedemptions?: number;

  @ApiProperty({
    description: 'Whether the coupon is currently active and can be claimed',
    example: true,
    required: false,
    type: Boolean,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({
    description:
      'List of tasks that users must complete before they can claim the coupon',
    enum: RequiredTask,
    isArray: true,
    required: false,
    enumName: 'RequiredTask',
    example: [RequiredTask.DAILY_LOGIN, RequiredTask.PLAY_GAMES],
  })
  @IsArray()
  @IsEnum(RequiredTask, { each: true })
  @IsOptional()
  requiredTasks?: RequiredTask[];

  @ApiProperty({
    description:
      "Minimum deposit amount required in the user's account to claim the coupon",
    example: 50,
    minimum: 0,
    required: false,
    type: Number,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  minimumDepositAmount?: number;

  @ApiProperty({
    description:
      'Minimum number of games the user must have played to claim the coupon',
    example: 10,
    minimum: 0,
    required: false,
    type: Number,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  minGamesPlayed?: number;

  @ApiProperty({
    description:
      'Number of hours to wait after account creation before the coupon can be claimed',
    example: 24,
    minimum: 0,
    required: false,
    type: Number,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  claimDelayInHours?: number;

  @ApiProperty({
    description:
      'Required number of consecutive daily logins to claim the coupon',
    example: 3,
    minimum: 0,
    required: false,
    type: Number,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  loginStreakRequired?: number;

  @ApiProperty({
    description:
      'Name of a custom condition function to evaluate before allowing coupon claim',
    required: false,
    type: String,
  })
  @IsString()
  @IsOptional()
  customConditionFnName?: string;

  @ApiProperty({
    description: 'Detailed description of the coupon and its conditions',
    required: false,
    type: String,
    example:
      'Welcome bonus for new players! Get 100 bonus balance after playing 10 games.',
  })
  @IsString()
  @IsOptional()
  description?: string;
}

export class ClaimCouponDto {
  @ApiProperty({
    description: 'Code of the coupon to claim',
    example: 'WELCOME2024',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  code: string;
}

export class CouponResponseDto {
  @ApiProperty({
    description: 'Unique coupon code',
    example: 'WELCOME2024',
    type: String,
  })
  code: string;

  @ApiProperty({
    description: 'Amount of reward to be given',
    example: 100,
    type: Number,
  })
  rewardAmount: number;

  @ApiProperty({
    description: 'Type of reward to be given',
    enum: RewardType,
    example: RewardType.BONUS_BALANCE,
    enumName: 'RewardType',
  })
  rewardType: RewardType;

  @ApiProperty({
    description: 'Date and time when the coupon will expire',
    example: '2024-12-31T23:59:59Z',
    type: Date,
  })
  expiryDate: Date;

  @ApiProperty({
    description: 'Whether the coupon is currently active and can be claimed',
    example: true,
    type: Boolean,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Detailed description of the coupon and its conditions',
    required: false,
    type: String,
    example:
      'Welcome bonus for new players! Get 100 bonus balance after playing 10 games.',
  })
  description?: string;

  @ApiProperty({
    description: 'Current number of times the coupon has been redeemed',
    example: 50,
    type: Number,
  })
  currentRedemptions: number;

  @ApiProperty({
    description: 'Maximum number of times this coupon can be redeemed',
    example: 100,
    type: Number,
  })
  maxRedemptions: number;
}

// New DTO for schema type definition
export class CouponDto {
  @ApiPropertyOptional()
  _id?: string;

  @ApiProperty()
  @IsString()
  code: string;

  @ApiProperty()
  @IsNumber()
  rewardAmount: number;

  @ApiProperty()
  @IsEnum(RewardType)
  rewardType: RewardType;

  @ApiProperty()
  @IsDate()
  expiryDate: Date;

  @ApiProperty()
  @IsNumber()
  maxRedemptions: number;

  @ApiProperty()
  @IsBoolean()
  isActive: boolean;

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsEnum(RequiredTask, { each: true })
  requiredTasks: RequiredTask[];

  @ApiProperty()
  @IsNumber()
  minimumDepositAmount: number;

  @ApiProperty()
  @IsNumber()
  minGamesPlayed: number;

  @ApiProperty()
  @IsNumber()
  claimDelayInHours: number;

  @ApiProperty()
  @IsNumber()
  loginStreakRequired: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  customConditionFnName?: string;

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  redeemedBy: string[];

  @ApiProperty()
  @IsNumber()
  currentRedemptions: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional()
  @IsDate()
  @IsOptional()
  createdAt?: Date;

  @ApiPropertyOptional()
  @IsDate()
  @IsOptional()
  updatedAt?: Date;
}
