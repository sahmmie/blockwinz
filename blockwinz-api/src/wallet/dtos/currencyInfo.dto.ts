import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from '@nestjs/class-validator';
import { Currency } from '@blockwinz/shared';

export class currencyInfoDto {
  @ApiProperty({
    description: 'The amount of the asset',
    type: Number,
    example: 1000,
  })
  @IsNotEmpty()
  amount: number;

  @ApiProperty({
    description: 'The symbol of the asset',
    type: String,
    example: Currency.SOL,
  })
  @IsNotEmpty()
  @IsEnum(Currency)
  currency: Currency;

  @ApiProperty({
    description: 'The number of decimals for the asset',
    type: Number,
    example: 8,
  })
  @IsNotEmpty()
  decimals: number;
}
