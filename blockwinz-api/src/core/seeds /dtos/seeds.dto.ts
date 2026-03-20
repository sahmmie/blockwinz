import { UserDto } from 'src/shared/dtos/user.dto';
import { SeedStatus } from '@blockwinz/shared';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsUUID,
  IsOptional,
  IsEnum,
  IsString,
  IsDate,
} from '@nestjs/class-validator';

export class GenerateServerSeedsResponseDto {
  serverSeed: string;
  serverHash: string;
}

export class GenerateClientSeedResponseDto {
  clientSeed: string;
}

export class CreateSeedRequestDto {
  serverSeed: string;
  serverSeedHash: string;
  clientSeed: string;
  status: SeedStatus;
  user: string | UserDto;
  deactivatedAt?: Date;
}

export class SeedDto {
  _id?: string;

  @ApiProperty({
    description: 'Unique identifier for the seed',
    example: 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6',
  })
  @IsUUID()
  @IsOptional() // UUID will be auto-generated if not provided
  id?: string;

  @ApiProperty({
    description: 'Current status of the seed',
    enum: SeedStatus,
  })
  @IsEnum(SeedStatus)
  status: SeedStatus;

  @ApiProperty({
    description: 'Client seed value',
    example: 'client_seed_value',
  })
  @IsString()
  clientSeed: string;

  @ApiProperty({
    description: 'Server seed value',
    example: 'server_seed_value',
  })
  @IsString()
  serverSeed: string;

  @ApiProperty({
    description: 'Hash of the server seed',
    example: 'server_seed_hash_value',
  })
  @IsString()
  serverSeedHash: string;

  @ApiProperty({
    description: 'Timestamp when the seed was created',
    example: '2024-11-20T12:00:00.000Z',
  })
  @IsDate()
  @IsOptional() // Handled by the database
  createdAt?: Date;

  @ApiProperty({
    description: 'Timestamp when the seed was deactivated',
    example: '2024-11-21T12:00:00.000Z',
    required: false,
  })
  @IsDate()
  @IsOptional()
  deactivatedAt?: Date;

  @ApiProperty({
    description: 'Player associated with this seed',
    type: String,
    example: 'player_id_value',
    required: false,
  })
  @IsString()
  @IsOptional()
  user: string | UserDto;
}
