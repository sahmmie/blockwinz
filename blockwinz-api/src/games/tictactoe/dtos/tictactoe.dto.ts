import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from '@nestjs/class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TicTacToeMultiplier, TicTacToeStatus } from '../enums/tictactoe.enums';
import { Type } from 'class-transformer';
import { BaseGameDto } from 'src/shared/dtos/baseGame.dto';
import { Currency } from '@blockwinz/shared';

export class TicTacToeStartReqDto {
  @ApiProperty({
    description: 'Bet amount for the game',
    type: Number,
    example: 1,
  })
  @IsNumber({}, { message: 'BetAmount must be a number' })
  betAmount: number;

  @ApiProperty({
    description: 'Currency for the game',
    type: String,
  })
  @IsEnum(Currency, {
    message: 'Currency must be either ' + Object.values(Currency).join(', '),
  })
  @IsString({ message: 'Currency must be a string' })
  @Type(() => String)
  currency: Currency;

  @ApiProperty({
    description: 'Multiplier for the game',
    enum: TicTacToeMultiplier,
    example: TicTacToeMultiplier.LOW,
  })
  @IsEnum(TicTacToeMultiplier, {
    message:
      'Multiplier must be either ' +
      Object.values(TicTacToeMultiplier).join(', '),
  })
  multiplier: TicTacToeMultiplier;

  @ApiPropertyOptional({
    description: 'Indicates if the game is in turbo mode',
    type: Boolean,
    default: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'IsTurboMode must be a boolean' })
  isTurboMode;
}
export class TicTacToeMoveDto {
  @ApiProperty({
    description: 'Move made by the player or AI',
    type: 'object',
    example: { row: 1, column: 2 },
  })
  @IsObject({ message: 'Move must be an object' })
  move: { row: number; column: number };
}

export class TicTacToeMoveResponseDto {
  @ApiProperty({
    description: 'Current state of the board',
    type: 'array',
    example: [
      ['X', 'O', 'O'],
      ['X', 'X', 'O'],
      ['O', 'O', 'X'],
    ],
  })
  @IsArray({ message: 'Board must be a 2D array' })
  board: string[][];

  @ApiProperty({
    description: 'Move made by the player or AI',
    type: 'object',
    example: { row: 1, column: 2 },
  })
  @IsObject({ message: 'Move must be an object' })
  move: { row: number; column: number };

  @ApiPropertyOptional({
    description: 'Current status of the game',
    type: 'string',
    enum: TicTacToeStatus,
    example: 'win',
  })
  @IsEnum(TicTacToeStatus, {
    message: 'Status must be one of: in progress, win, tie, loss',
  })
  betResultStatus: TicTacToeStatus;

  @ApiPropertyOptional({
    description: 'Current turn of the game',
    type: 'string',
    enum: ['X', 'O', null],
    nullable: true,
  })
  @IsOptional()
  @IsEnum(['X', 'O', null], { message: 'CurrentTurn must be X, O, or null' })
  currentTurn: string | null;
}

export class TicTacToeDto extends BaseGameDto {
  @ApiProperty({
    description: 'Multiplier for the game',
    enum: TicTacToeMultiplier,
    example: TicTacToeMultiplier.LOW,
  })
  @IsEnum(TicTacToeMultiplier, {
    message: 'Multiplier must be either easy, medium, or hard',
  })
  multiplier: any;

  @ApiProperty({
    description: '2D board state as an array of Xs and Os',
    type: [[String]],
    example: [
      ['X', 'O', ''],
      ['', 'X', ''],
      ['O', '', ''],
    ],
  })
  @ValidateNested({ each: true })
  @Type(() => String)
  board: string[][];

  @ApiProperty({
    description: 'Current status of the game',
    enum: TicTacToeStatus,
    example: TicTacToeStatus.IN_PROGRESS,
  })
  @IsEnum(TicTacToeStatus, {
    message: 'Status must be a valid TicTacToeStatus enum value',
  })
  betResultStatus: TicTacToeStatus;

  @ApiPropertyOptional({
    description: 'Whose turn it is currently (X or O)',
    enum: ['X', 'O', null],
    nullable: true,
  })
  @IsOptional()
  @IsEnum(['X', 'O', null], { message: 'CurrentTurn must be X, O, or null' })
  currentTurn: 'X' | 'O' | null;

  @ApiProperty({
    description: 'What Value is the User',
    enum: ['X', 'O'],
  })
  @IsEnum(['X', 'O'], { message: 'User must be either X or O' })
  userIs: string;

  @ApiProperty({
    description: 'What Value is the AI',
    enum: ['X', 'O'],
  })
  @IsEnum(['X', 'O'], { message: 'AI must be either X or O' })
  aiIs: string;
}
