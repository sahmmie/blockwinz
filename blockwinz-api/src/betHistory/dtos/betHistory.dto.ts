import {
  IsNotEmpty,
  IsUUID,
  IsEnum,
  IsDate,
  IsNumber,
  IsOptional,
  IsString,
} from '@nestjs/class-validator';
import { DbGameSchema } from 'src/shared/enums/dbSchema.enum';

export class BetHistoryDto {
  @IsNotEmpty()
  @IsUUID('4')
  id: string;

  @IsNotEmpty()
  @IsUUID('4')
  user: string;

  @IsNotEmpty()
  @IsUUID('4')
  gameId: string;

  @IsNotEmpty()
  @IsEnum(DbGameSchema)
  gameType: DbGameSchema;

  @IsString()
  currency: string;

  @IsOptional()
  @IsNumber()
  multiplier?: number;

  @IsNumber()
  betAmount: number;

  @IsOptional()
  @IsNumber()
  totalWinAmount?: number;

  @IsDate()
  createdAt?: Date;
}
