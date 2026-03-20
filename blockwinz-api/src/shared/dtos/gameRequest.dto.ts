import { ApiProperty, ApiHideProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';
import { Currency } from '../enums/currencies.enum';
import { IsEnum } from '@nestjs/class-validator';
import { ROUND_DECIMALS } from '../constants/extra.constatnt';

export class CommonGameRequestDto {
  @ApiProperty({
    description: 'Bet amount',
    type: 'number',
    example: 100,
  })
  @IsNumber(
    { maxDecimalPlaces: ROUND_DECIMALS },
    { message: 'Bet amount must be a number' },
  )
  betAmount: number;

  @ApiProperty({
    description: 'Currency',
    type: 'string',
  })
  @IsString({ message: 'Bet currency must be the correct currency' })
  @IsEnum(Currency)
  currency: Currency;

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
  @IsOptional()
  @IsBoolean()
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

  @ApiHideProperty()
  readonly seed?: string;
}

export abstract class SpecificGameRequestDto extends CommonGameRequestDto {}
