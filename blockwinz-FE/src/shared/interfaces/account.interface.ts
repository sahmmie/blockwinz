// types.ts

export interface ActiveSeedI {
    _id: string;
    status: string;
    clientSeed: string;
    serverSeed: string;
    serverSeedHash: string;
    deactivatedAt: string | null;
    user: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
}

export interface ProfileI {
    _id: string;
    isHotKeysActive: boolean;
    isMuted: boolean;
    isTurbo: boolean;
    canWithdraw: boolean;
    createdAt: string;
    updatedAt: string;
    __v: number;
}

export interface UserI {
    _id: string;
    username: string;
    email: string;
    emailVerified: boolean;
    faEnabled: boolean;
    nonce: number;
    futureClientSeed: string;
    futureServerSeed: string;
    futureServerSeedHash: string;
    activeSeed: ActiveSeedI; // Reference to the ActiveSeed interface
    userAccounts: string[];
    profile: ProfileI; // Reference to the Profile interface
    createdAt: string;
    updatedAt: string;
}

export interface ActiveSeedPairI {
    _id: string;
    nonce: number;
    clientSeed: string;
    serverSeedHashed: string;
    futureClientSeed: string;
    futureServerSeedHashed: string;
}