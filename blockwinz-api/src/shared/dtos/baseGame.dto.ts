import {
  ApiHideProperty,
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';
import {
  IsBoolean,
  IsDate,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Currency } from '../enums/currencies.enum';
import { IsEnum } from '@nestjs/class-validator';

export class BaseGameDto {
  @ApiProperty({
    description: 'Unique identifier of the game',
    type: String,
  })
  @IsString()
  _id?: string;

  @ApiPropertyOptional() @IsString() id?: string;

  @ApiProperty({
    description: 'ID of the user associated with the game',
    type: String,
  })
  @IsString()
  user: string;

  @ApiProperty({
    description: 'Bet amount placed in the game',
    type: Number,
    example: 100,
  })
  @IsNumber({}, { message: 'Bet amount must be a number' })
  betAmount: number;

  @ApiProperty({
    description: 'Currency used for the bet',
    type: String,
    enum: Currency,
  })
  @IsString({ message: 'Currency must be the correct currency' })
  @IsEnum(Currency)
  currency: Currency;

  @ApiProperty({
    description: 'Nonce used for the game',
    type: Number,
    example: 42,
  })
  @IsNumber({}, { message: 'Nonce must be a number' })
  nonce: number;

  @ApiHideProperty()
  readonly seed?: string;

  @ApiPropertyOptional({
    description: 'Multiplier applied to the bet',
    type: Number,
    example: 2.5,
    nullable: true,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Multiplier must be a number' })
  multiplier: number | null;

  @ApiPropertyOptional({
    description: 'The resulting number of the bet',
    type: Number,
    example: 1.75,
    nullable: true,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Bet result number must be a number' })
  betResultNumber?: number | null;

  @ApiPropertyOptional({
    description: 'The status of the bet result',
    type: String,
    example: 'win',
  })
  @IsOptional()
  @IsString({ message: 'Bet result status must be a string' })
  betResultStatus: string;

  @ApiPropertyOptional({
    description: 'Condition to stop the game on profit',
    type: Number,
    example: 200,
    nullable: true,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Stop on profit must be a number' })
  stopOnProfit?: number | null;

  @ApiPropertyOptional({
    description: 'Condition to stop the game on loss',
    type: Number,
    example: 50,
    nullable: true,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Stop on loss must be a number' })
  stopOnLoss?: number | null;

  @ApiPropertyOptional({
    description: 'Value by which the bet amount increases dynamically',
    type: Number,
    example: 10,
    nullable: true,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Increase by must be a number' })
  increaseBy?: number | null;

  @ApiPropertyOptional({
    description: 'Value by which the bet amount decreases dynamically',
    type: Number,
    example: 5,
    nullable: true,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Decrease by must be a number' })
  decreaseBy?: number | null;

  @ApiPropertyOptional({
    description: 'Indicates if the game is in manual mode',
    type: Boolean,
    example: true,
    nullable: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'Manual mode flag must be a boolean' })
  isManualMode?: boolean | null;

  @ApiPropertyOptional({
    description: 'Indicates if the game is in turbo mode',
    type: Boolean,
    example: false,
    nullable: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'Turbo mode flag must be a boolean' })
  isTurboMode?: boolean | null;

  @ApiProperty({
    description: 'Timestamp when the game was created',
    type: Date,
    example: '2024-11-20T12:34:56Z',
  })
  @IsDate({ message: 'CreatedAt must be a valid date' })
  createdAt?: Date;

  @ApiProperty({
    description: 'Timestamp when the game was last updated',
    type: Date,
    example: '2024-11-21T08:22:10Z',
  })
  @IsDate({ message: 'UpdatedAt must be a valid date' })
  updatedAt?: Date;

  @ApiPropertyOptional({
    description: 'Total win amount',
    type: Number,
    example: 500,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Total win amount must be a number' })
  totalWinAmount: number;
}
