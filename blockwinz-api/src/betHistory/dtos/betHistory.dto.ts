import {
  IsNotEmpty,
  IsUUID,
  IsEnum,
  IsDate,
  IsNumber,
  IsOptional,
  IsString,
  IsArray,
} from '@nestjs/class-validator';
import { DbGameSchema } from '@blockwinz/shared';

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

  /** Provably-fair inputs (joined from game + seeds when available) */
  @IsOptional()
  @IsString()
  clientSeed?: string;

  @IsOptional()
  @IsNumber()
  nonce?: number;

  @IsOptional()
  @IsString()
  serverSeedHash?: string;

  /** Plain server seed when the seed pair has been rotated / revealed */
  @IsOptional()
  @IsString()
  serverSeed?: string;

  @IsOptional()
  @IsString()
  seedStatus?: string;

  /** Coin Flip round params for Provably Fair verify UI (from `coinflip_games`). */
  @IsOptional()
  @IsNumber()
  coinflipCoins?: number;

  @IsOptional()
  @IsNumber()
  coinflipMin?: number;

  @IsOptional()
  @IsNumber()
  coinflipSide?: number;

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  coinflipResults?: number[];

  @IsDate()
  createdAt?: Date;
}
