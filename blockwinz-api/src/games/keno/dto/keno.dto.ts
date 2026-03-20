import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsNumber,
  ArrayMinSize,
  ArrayMaxSize,
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { KenoGameStatus, KenoRisk } from '../enums/keno.enums';
import { SpecificGameRequestDto } from 'src/shared/dtos/gameRequest.dto';
import { BaseGameDto } from 'src/shared/dtos/baseGame.dto';

@ValidatorConstraint({ name: 'uniqueArray', async: false })
export class UniqueArrayValidator implements ValidatorConstraintInterface {
  validate(value: any[]) {
    const uniqueSet = new Set(value);
    return uniqueSet.size === value.length;
  }

  defaultMessage() {
    return 'Selected numbers must be unique';
  }
}

export class KenoBetRequestDto extends SpecificGameRequestDto {
  @ApiProperty({
    description:
      'Selected numbers for the Keno bet. You must select at least 1 and at most 10 numbers.',
    type: [Number],
    example: [1, 5, 12, 20, 25, 30, 35, 40],
  })
  @IsArray({ message: 'Selected numbers must be an array of numbers' })
  @ArrayMinSize(1, { message: 'You must select at least 1 number' })
  @ArrayMaxSize(10, { message: 'You can select at most 10 numbers' })
  @IsNumber(
    {},
    { each: true, message: 'Each selected number must be a number' },
  )
  @Validate(UniqueArrayValidator)
  selectedNumbers: number[];

  @ApiProperty({
    description: 'Risk level associated with the Keno bet',
    enum: KenoRisk,
    example: KenoRisk.CLASSIC,
  })
  @IsEnum(KenoRisk, {
    message: 'Risk must be one of Classic, Low, Medium, High',
  })
  risk: KenoRisk;
}

export class KenoBetResponseDto {
  @ApiProperty({
    description: 'Game status',
    enum: KenoGameStatus,
    example: KenoGameStatus.WIN,
  })
  status: KenoGameStatus;

  @ApiProperty({
    description: 'Multiplier applied to the bet',
    type: 'number',
    example: 3.96,
  })
  multiplier: number;

  @ApiProperty({
    description: 'Resulting numbers from the Keno game',
    type: [Number],
    example: [1, 7, 12, 20, 25, 30, 35, 40, 42, 45],
  })
  result: number[];

  @ApiProperty({
    description: 'Number of hits the player achieved',
    type: 'number',
    example: 3,
  })
  hits: number;
}

export class KenoGameDto extends BaseGameDto {
  @ApiProperty({ description: 'The multiplier for the bet', example: 2.5 })
  @IsNumber()
  multiplier: number;

  @ApiProperty({
    description: 'Numbers selected by the player',
    type: [Number],
    example: [1, 2, 3],
  })
  @IsArray()
  @IsNumber({}, { each: true })
  selectedNumbers: number[];

  @ApiProperty({
    description: 'Numbers that resulted from the game',
    type: [Number],
    example: [4, 5, 6],
  })
  @IsArray()
  @IsNumber({}, { each: true })
  resultNumbers: number[];

  @ApiProperty({
    description: 'Risk level associated with the Keno game',
    enum: KenoRisk,
  })
  @IsEnum(KenoRisk)
  risk: KenoRisk;
}
