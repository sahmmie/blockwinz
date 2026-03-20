import { UserDto } from 'src/shared/dtos/user.dto';
import { SeedStatus } from '@blockwinz/shared';
export declare class GenerateServerSeedsResponseDto {
    serverSeed: string;
    serverHash: string;
}
export declare class GenerateClientSeedResponseDto {
    clientSeed: string;
}
export declare class CreateSeedRequestDto {
    serverSeed: string;
    serverSeedHash: string;
    clientSeed: string;
    status: SeedStatus;
    user: string | UserDto;
    deactivatedAt?: Date;
}
export declare class SeedDto {
    _id?: string;
    id?: string;
    status: SeedStatus;
    clientSeed: string;
    serverSeed: string;
    serverSeedHash: string;
    createdAt?: Date;
    deactivatedAt?: Date;
    user: string | UserDto;
}
//# sourceMappingURL=seeds.dto.d.ts.map