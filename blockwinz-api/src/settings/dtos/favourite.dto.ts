import {
  IsArray,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from '@nestjs/class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { UserDto } from 'src/shared/dtos/user.dto';
import { DbGameSchema } from '@blockwinz/shared';

class GameItemDto {
  @ApiProperty({ description: 'Game identifier or name' })
  @IsString()
  @IsNotEmpty()
  @IsEnum(DbGameSchema)
  game: DbGameSchema;

  @ApiProperty({ description: 'Date the game was added to favourites' })
  @IsDate()
  addedAt: Date;
}

export class FavouriteDto {
  @ApiProperty({ description: 'Owner of the favourite' })
  @IsString()
  user: string | UserDto;

  @ApiProperty({ description: 'List of favourite games with timestamps' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GameItemDto)
  games: GameItemDto[];

  @ApiPropertyOptional({
    description: 'Timestamp when the favourite was created',
  })
  @IsOptional()
  @IsDate()
  createdAt?: Date;

  @ApiPropertyOptional({
    description: 'Timestamp when the favourite was last updated',
  })
  @IsOptional()
  @IsDate()
  updatedAt?: Date;
}
