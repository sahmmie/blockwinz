import { ApiProperty, ApiHideProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';
import { Currency, StakeDenomination } from '@blockwinz/shared';
import { IsEnum } from '@nestjs/class-validator';
export class CommonGameRequestDto {
  @ApiProperty({
    description:
      'Bet amount in native currency (SOL/BWZ). Normalized with ROUND_DECIMALS in CurrencyInterceptor. For stakeDenomination usd, resolver sets this before validation.',
    type: 'number',
    example: 0.1,
  })
  @IsNumber({}, { message: 'Bet amount must be a number' })
  betAmount: number;

  @ApiPropertyOptional({
    description: 'Stake size in USD (SOL wallet only); server converts to SOL',
    example: 10,
  })
  @ValidateIf(
    (o: CommonGameRequestDto) =>
      o.stakeDenomination === StakeDenomination.Usd &&
      o.usdAmount !== undefined &&
      o.usdAmount !== null,
  )
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'usdAmount must be a number' },
  )
  usdAmount?: number;

  @ApiPropertyOptional({
    description: 'Whether betAmount / usdAmount is in native token or USD',
    enum: StakeDenomination,
    example: StakeDenomination.Native,
  })
  @IsOptional()
  @IsEnum(StakeDenomination)
  stakeDenomination?: StakeDenomination;

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
