import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsIn, IsNumber, Max, Min } from 'class-validator';
import { SpecificGameRequestDto } from '../../../shared/dtos/gameRequest.dto';
import { CoinFlipGameStatus } from '../enums/coinflip.enums';

export class GetCoinFlipResultDto extends SpecificGameRequestDto {
  @ApiProperty({
    description: 'Min coins',
    type: 'number',
    example: 1,
  })
  @IsNumber({}, { message: 'Min must be a number' })
  @Min(1)
  @Max(10)
  min: number;

  @ApiProperty({
    description: 'Coin amount',
    type: 'number',
    example: 1,
  })
  @IsNumber({}, { message: 'Coins must be a number' })
  @Min(1)
  @Max(10)
  coins: number;

  @ApiProperty({
    description: 'Coin type',
    type: 'number',
    example: 1,
  })
  @IsNumber({}, { message: 'Coin type must be a number' })
  @IsIn([0, 1], { message: 'Should be 0 or 1' })
  coinType: number;
}

export class GetCoinFlipResultResponseDto {
  @ApiProperty({
    description: 'Results array',
    type: [Number],
    example: [1, 0, 1],
  })
  @IsArray({ message: 'Results must be an array of numbers' })
  @IsNumber({}, { each: true, message: 'Each result must be a number' })
  results: number[];

  @ApiProperty({
    description: 'Multiplier',
    type: 'number',
    example: 1.1,
  })
  @IsNumber({}, { message: 'Multiplier must be a number' })
  multiplier: number;

  @ApiProperty({
    description: 'Win or lose outcome',
    type: 'string',
    example: 'win',
  })
  @IsEnum(CoinFlipGameStatus, {
    message: 'betResultStatus must be a valid enum value',
  })
  betResultStatus: CoinFlipGameStatus;
}
