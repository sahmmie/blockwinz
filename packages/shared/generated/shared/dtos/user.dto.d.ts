import { UserAccountEnum } from '@blockwinz/shared';
import { SeedDto } from 'src/core/seeds /dtos/seeds.dto';
import { ProfileDto } from './profile.dto';
export declare class UserDto {
    id?: string;
    _id?: string;
    __v?: number;
    email: string;
    password: string;
    userAccounts: UserAccountEnum[];
    profile?: string | ProfileDto;
    username: string;
    lastLogin?: Date;
    lastLogout?: Date;
    faEnabled?: boolean;
    nonce?: number;
    futureClientSeed?: string;
    futureServerSeed?: string;
    futureServerSeedHash?: string;
    activeSeed?: string | SeedDto;
    emailVerified?: boolean;
    referralCode?: string;
    emailVerificationToken?: string;
    emailVerificationTokenExpires?: Date;
    emailVerificationResendCount?: number;
}
export declare class LoginDto {
    password: string;
    username: string;
}
export declare class ChangeEmailDto {
    email: string;
}
//# sourceMappingURL=user.dto.d.ts.map