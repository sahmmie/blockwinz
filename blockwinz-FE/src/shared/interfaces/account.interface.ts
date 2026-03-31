// types.ts

export interface ActiveSeedI {
    id?: string;
    _id: string;
    status: string;
    clientSeed: string;
    serverSeedHash: string;
    deactivatedAt?: string | null;
}

export interface ProfileI {
    id?: string;
    _id: string;
    user?: string;
    canWithdraw: boolean;
    isHotKeysActive: boolean;
    isMuted: boolean;
    isBanned?: boolean;
    isTurbo: boolean;
    referralCode?: string;
    referredBy?: string;
    referralCount?: number;
    referralEarnings?: number;
    createdAt?: string;
    updatedAt?: string;
}

export interface UserI {
    id?: string;
    _id: string;
    username: string;
    email: string;
    emailVerified: boolean;
    faEnabled?: boolean;
    nonce?: number;
    lastLogin?: string;
    lastLogout?: string;
    futureClientSeed?: string;
    activeSeed?: ActiveSeedI | string;
    userAccounts: string[];
    profile?: ProfileI | string;
    createdAt?: string;
    updatedAt?: string;
}

export interface ActiveSeedPairI {
    _id?: string;
    nonce: number;
    clientSeed: string;
    serverSeedHashed: string;
    futureClientSeed: string;
    futureServerSeedHashed: string;
}