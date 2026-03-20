import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsString } from '@nestjs/class-validator';
import { IsRollOverBetValid } from '../validators/validations';
import { SpecificGameRequestDto } from 'src/shared/dtos/gameRequest.dto';
import { DiceGameStatus, RollDirection } from '../enums/dice.enums';
import { Currency } from 'src/shared/enums/currencies.enum';

export class RollDiceDto extends SpecificGameRequestDto {
  @ApiProperty({
    description: 'Roll Over Bet',
    type: 'number',
    example: 50.5,
  })
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'Roll Over Bet must be a number' },
  )
  @IsRollOverBetValid()
  rollOverBet: number;

  @ApiProperty({
    description: 'Direction of the bet',
    type: 'string',
    example: 'over',
  })
  @IsString({ message: 'Direction of the bet must be a string' })
  direction: RollDirection;
}

export class RollDiceWithGameTokenDto extends RollDiceDto {
  @ApiProperty({
    description: 'Amount of money the player is betting',
    example: 1,
  })
  @IsNumber({}, { message: 'Bet amount must be a number' })
  betAmount: number;

  @ApiProperty({
    description: 'Currency of the bet',
    enum: Currency,
  })
  @IsString({ message: 'Bet currency must be the correct token hash' })
  currency: Currency;

  @ApiProperty({
    description: 'Bet value for rolling over',
    example: 10,
  })
  @IsNumber({}, { message: 'Roll over bet must be a number' })
  rollOverBet: number;

  @ApiProperty({
    description: 'Direction of the bet (e.g., over or under)',
    enum: RollDirection,
    example: RollDirection.OVER,
  })
  @IsEnum(RollDirection, {
    message: 'Roll direction must be either over or under',
  })
  direction: RollDirection;
}

export class DicesRoundEndDto {
  @ApiProperty({
    description: 'Status of the dice game after the round (e.g., Win, Loss)',
    enum: DiceGameStatus,
    example: DiceGameStatus.WIN,
  })
  @IsEnum(DiceGameStatus, { message: 'Status must be either win or loss' })
  betResultStatus: DiceGameStatus;

  @ApiProperty({
    description: 'The result of the dice roll',
    example: 65,
  })
  @IsNumber({}, { message: 'Result must be a number' })
  result: number;

  @ApiProperty({
    description: 'The target number that the player was trying to beat',
    example: 70,
  })
  @IsNumber({}, { message: 'Target must be a number' })
  target: number;

  @ApiProperty({
    description: 'The total amount of won for the game',
    example: 10,
  })
  @IsNumber({}, { message: 'Total win amount must be a number' })
  totalWinAmount: number;

  @IsNumber({}, { message: 'Multiplier must be a number' })
  multiplier: number;
}
