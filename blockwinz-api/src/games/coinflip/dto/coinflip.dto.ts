import { IsString, IsNumber, IsBoolean } from 'class-validator';
import { BaseGameDto } from 'src/shared/dtos/baseGame.dto';

export class CoinflipDto extends BaseGameDto {
  @IsString()
  player: string;

  @IsNumber()
  betAmount: number;

  @IsBoolean()
  isHeads: boolean;

  @IsString()
  result: string;
}
