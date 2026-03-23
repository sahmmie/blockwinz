import { ApiProperty } from '@nestjs/swagger';
import {
  IsNumber,
  Min,
  Max,
  ArrayMaxSize,
  ArrayUnique,
  ArrayMinSize,
  IsEnum,
  IsArray,
  IsString,
  IsUUID,
} from '@nestjs/class-validator';
import { MinesGameStatus } from '../enums/mines.enums';
import { SpecificGameRequestDto } from 'src/shared/dtos/gameRequest.dto';
import { BaseGameDto } from 'src/shared/dtos/baseGame.dto';
import { Currency } from '@blockwinz/shared';

export class StartMineDto extends SpecificGameRequestDto {
  @ApiProperty({
    type: 'number',
    required: true,
    description: 'Number of mines',
    example: 5,
  })
  @IsNumber({}, { message: 'Number of mines must be a number' })
  @Min(1, { message: 'Number of mines must be greater than 0' })
  @Max(24, { message: 'Number of mines must be less than 25' })
  minesCount: number;
}

export class MinesResponseDto {
  _id?: string;

  id?: string;

  user?: string;

  @ApiProperty({
    type: [Object],
    description:
      'The result of the mine game, can include various details about the game state',
  })
  minesResult: any[];

  @ApiProperty({
    type: Number,
    description: 'The next win multiplier if the player continues the game',
  })
  nextWinMultiplier: number;

  @ApiProperty({
    type: String,
    description: 'Currency used in the game',
  })
  @IsEnum(Currency)
  @IsString({ message: 'Currency must be the correct currency' })
  currency: Currency;

  @ApiProperty({
    type: [Number],
    description: 'Indexes of tiles that the player has selected',
  })
  selected: number[];

  @ApiProperty({
    type: Number,
    description: 'The amount the player has bet for the game',
  })
  betAmount: number;

  @ApiProperty({
    type: Date,
    description: 'Timestamp when the game session was created',
  })
  createdAt: Date;

  @ApiProperty({
    enum: MinesGameStatus,
    description: 'The current status of the game (e.g., ongoing, won, lost)',
  })
  betResultStatus: MinesGameStatus;

  @ApiProperty({
    type: Number,
    description: 'The number of mines in the game',
  })
  minesCount: number;

  @ApiProperty({
    type: Number,
    description:
      'The current win multiplier based on selected tiles and game progress',
  })
  multiplier: number;

  @ApiProperty({
    type: Number,
    description: 'The total amount the player has won in the game',
  })
  totalWinAmount: number;
}

export class RevealMineDto {
  @ApiProperty({
    format: 'uuid',
    required: true,
    description: 'Open mines game id',
    example: '19cba1db-54f2-4e8c-9fae-ece2ae1787b1',
  })
  @IsUUID('4', { message: 'gameId must be a valid UUID' })
  gameId: string;

  @ApiProperty({
    type: 'number',
    required: true,
    description: 'Mine position',
    example: 1,
  })
  @IsNumber({}, { message: 'Mine position must be a number' })
  @Min(0, { message: 'Mine position must be greater than or equal to 0' })
  @Max(24, { message: 'Mine position must be less than 25' })
  position: number;
}

export class MinesCashoutDto {
  @ApiProperty({
    format: 'uuid',
    required: true,
    description: 'Open mines game id to cash out',
    example: '19cba1db-54f2-4e8c-9fae-ece2ae1787b1',
  })
  @IsUUID('4', { message: 'gameId must be a valid UUID' })
  gameId: string;
}

export class MinesAutoBetDto extends SpecificGameRequestDto {
  @ApiProperty({
    type: 'number',
    required: true,
    description: 'Number of mines',
    example: 5,
  })
  @IsNumber({}, { message: 'Number of mines must be a number' })
  @Min(1, { message: 'Number of mines must be greater than 0' })
  @Max(24, { message: 'Number of mines must be less than 25' })
  minesCount: number;

  @ApiProperty({
    description: 'Selected positions',
    type: 'array',
    example: [0, 1, 2, 3, 4],
  })
  @ArrayUnique()
  @ArrayMinSize(1, { message: 'You must select at least 1 position' })
  @ArrayMaxSize(24, { message: 'You can select at most 24 positions' })
  @Min(0, {
    each: true,
    message: 'Each selected position value must be greater than or equal to 0',
  })
  @Max(24, {
    each: true,
    message: 'Each selected position value must be less or equal to 24',
  })
  selected: number[];
}

export class MinesGameDto extends BaseGameDto {
  @ApiProperty({
    description: 'The current status of the bet',
    enum: MinesGameStatus,
    example: MinesGameStatus.OPEN,
  })
  @IsEnum(MinesGameStatus)
  betResultStatus: MinesGameStatus;

  @ApiProperty({ description: 'Total number of mines in the game', example: 3 })
  @IsNumber()
  minesCount: number;

  @ApiProperty({
    description: 'Array of selected mines by the player',
    type: [Number],
    example: [1, 2, 3],
  })
  @IsArray()
  @IsNumber({}, { each: true })
  selected: number[];

  @ApiProperty({
    description: 'Array of results from the mines',
    type: [Number],
    example: [1, 0, 0],
  })
  @IsArray()
  @IsNumber({}, { each: true })
  minesResult: number[];
}
