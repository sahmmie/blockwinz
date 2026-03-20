import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsIn, IsNumber, IsOptional } from 'class-validator';
import { BaseGameDto } from 'src/shared/dtos/baseGame.dto';
import {
  CommonGameRequestDto,
  SpecificGameRequestDto,
} from 'src/shared/dtos/gameRequest.dto';

export class SpinWheelDto extends SpecificGameRequestDto {
  @ApiProperty({
    description: 'Number of segments',
    type: 'number',
    example: 10,
  })
  @IsNumber({}, { message: 'Segments must be a number' })
  @IsIn([10, 20, 30, 40, 50], {
    message: 'Segments must be [10, 20, 30, 40, 50]',
  })
  segments: number;

  @ApiProperty({
    description: 'Risk level',
    type: 'string',
    example: 'LOW',
  })
  @IsIn(['LOW', 'MEDIUM', 'HIGH'], {
    message: "Risk must be 'LOW', 'MEDIUM' or 'HIGH'",
  })
  risk: string;

  @ApiProperty({
    description: 'Stop on profit limit',
    type: 'number',
    example: 100,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Stop on profit must be a number' })
  stopOnProfit?: number;

  @ApiProperty({
    description: 'Stop on loss limit',
    type: 'number',
    example: 50,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Stop on loss must be a number' })
  stopOnLoss?: number;

  @ApiProperty({
    description: 'Amount to increase by',
    type: 'number',
    example: 10,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Increase by must be a number' })
  increaseBy?: number;

  @ApiProperty({
    description: 'Amount to decrease by',
    type: 'number',
    example: 5,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Decrease by must be a number' })
  decreaseBy?: number;

  @ApiProperty({
    description: 'Indicates whether manual mode is active',
    type: 'boolean',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isManualMode?: boolean;

  @ApiProperty({
    description: 'Indicates whether turbo mode is active',
    type: 'boolean',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isTurboMode?: boolean;

  @ApiProperty({
    description: 'Multiplier for the game',
    type: 'number',
    example: 2.5,
  })
  @IsNumber({}, { message: 'Multiplier must be a number' })
  multiplier: number;

  totalWinAmount: number;
}

export class SpinWheelResponseDto extends CommonGameRequestDto {
  @ApiProperty({
    description: 'Risk level associated with the spin wheel',
    type: 'string',
    example: 'HIGH',
  })
  risk: string;

  @ApiProperty({
    description: 'Number of segments on the wheel',
    type: 'number',
    example: 8,
  })
  segments: number;

  @ApiProperty({
    description: 'Multiplier for the game result',
    type: 'number',
    example: 2.5,
  })
  multiplier: number;

  @ApiProperty({
    description: 'Total win amount',
    type: 'number',
    example: 250,
  })
  totalWinAmount: number;
}

export class WheelDto extends BaseGameDto {
  @ApiProperty({
    description: 'Number of segments',
    type: 'number',
    example: 10,
  })
  @IsNumber({}, { message: 'Segments must be a number' })
  @IsIn([10, 20, 30, 40, 50], {
    message: 'Segments must be [10, 20, 30, 40, 50]',
  })
  segments: number;

  @ApiProperty({
    description: 'Risk level',
    type: 'string',
    example: 'LOW',
  })
  @IsIn(['LOW', 'MEDIUM', 'HIGH'], {
    message: "Risk must be 'LOW', 'MEDIUM' or 'HIGH'",
  })
  risk: string;

  @ApiProperty({
    description: 'Stop on profit limit',
    type: 'number',
    example: 100,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Stop on profit must be a number' })
  stopOnProfit?: number;

  @ApiProperty({
    description: 'Stop on loss limit',
    type: 'number',
    example: 50,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Stop on loss must be a number' })
  stopOnLoss?: number;

  @ApiProperty({
    description: 'Amount to increase by',
    type: 'number',
    example: 10,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Increase by must be a number' })
  increaseBy?: number;

  @ApiProperty({
    description: 'Amount to decrease by',
    type: 'number',
    example: 5,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Decrease by must be a number' })
  decreaseBy?: number;

  @ApiProperty({
    description: 'Indicates whether manual mode is active',
    type: 'boolean',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isManualMode?: boolean;

  @ApiProperty({
    description: 'Indicates whether turbo mode is active',
    type: 'boolean',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isTurboMode?: boolean;
}
