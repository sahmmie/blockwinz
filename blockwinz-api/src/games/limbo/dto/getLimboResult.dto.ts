import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, Max, Min } from '@nestjs/class-validator';
import { LimboGameStatus } from '../enums/limbo.enums';
import { CommonGameRequestDto } from 'src/shared/dtos/gameRequest.dto';
import { BaseGameDto } from 'src/shared/dtos/baseGame.dto';

export class GetLimboResultRequestDto extends CommonGameRequestDto {
  @ApiProperty({
    description: 'Multiplier for the game result',
    type: 'number',
    example: 2,
  })
  @IsNumber({}, { message: 'Multiplier must be a number' })
  @Min(1.01, { message: 'Multiplier must be at least 1.01' })
  @Max(1000000, { message: 'Muiltiplier must be less than or equal 1000000' })
  multiplier: number;
}

export class GetLimboResultResponseDto {
  @ApiProperty({
    description: 'Result',
    type: 'number',
    example: 200,
  })
  @IsNumber({}, { message: 'Result must be a number' })
  result: number;

  @ApiProperty({
    description: 'Status',
    type: 'string',
    example: 'win',
  })
  @IsEnum(LimboGameStatus, { message: 'Status must be a valid enum value' })
  betResultStatus: LimboGameStatus;

  @ApiProperty({
    description: 'Total win amount',
    type: 'number',
    example: 100,
  })
  @IsNumber({}, { message: 'Total win amount must be a number' })
  totalWinAmount: number;
}

export class LimboGameDto extends BaseGameDto {
  @ApiProperty({
    description: 'The status of the bet result specific to Limbo game',
    enum: LimboGameStatus,
    example: LimboGameStatus.WIN,
  })
  @IsEnum(LimboGameStatus, { message: 'Status must be a valid enum value' })
  betResultStatus: LimboGameStatus;
}
