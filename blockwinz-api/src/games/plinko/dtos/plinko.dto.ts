import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsIn, IsNumber } from 'class-validator';
import { SpecificGameRequestDto } from 'src/shared/dtos/gameRequest.dto';

export class GetPlinkoResultRequestDto extends SpecificGameRequestDto {
  @ApiProperty({
    description: 'Number of rows',
    type: 'number',
    example: 8,
  })
  @IsNumber({}, { message: 'Rows must be a number' })
  rows: number;

  @ApiProperty({
    description: 'Risk level',
    type: 'string',
    example: 'LOW',
  })
  @IsIn(['LOW', 'MEDIUM', 'HIGH'], {
    message: "Risk must be 'LOW', 'MEDIUM' or 'HIGH'",
  })
  risk: string;
}

export class GetPlinkoResultResponseDto {
  @ApiProperty({
    description: 'Results array',
    type: [Number],
    example: [1, 0, 1, 0, 1, 1, 0, 1],
  })
  @IsArray({ message: 'Results must be an array of numbers' })
  @IsNumber({}, { each: true, message: 'Each result must be a number' })
  results: number[];

  @ApiProperty({
    description: 'Multiplier',
    type: 'number',
    example: 0.3,
  })
  @IsNumber({}, { message: 'Multiplier must be a number' })
  multiplier: number;

  @ApiProperty({
    description: 'Win amount',
    type: 'number',
    example: 0.3,
  })
  @IsNumber({}, { message: 'Win amount must be a number' })
  winAmount: number;
}
