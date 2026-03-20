import {
  IsNotEmpty,
  IsUUID,
  IsEnum,
  IsDate,
  IsNumber,
} from '@nestjs/class-validator';
import { DbGameSchema } from 'src/shared/enums/dbSchema.enum';

export class BetHistoryDto {
  @IsNotEmpty()
  @IsUUID('4')
  user: string;

  @IsNotEmpty()
  @IsUUID('4')
  gameId: string;

  @IsNotEmpty()
  @IsEnum(DbGameSchema)
  gameType: DbGameSchema;

  @IsNumber()
  betAmount: number;

  @IsNumber()
  totalWinAmount: number;

  @IsDate()
  createdAt?: Date;
}
