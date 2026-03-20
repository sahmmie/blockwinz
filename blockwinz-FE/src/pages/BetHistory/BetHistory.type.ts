import { Currency } from "@/shared/enums/currency.enum";
import { GameTypeEnum } from "@/shared/enums/gameType.enum";
import { UserI } from "@/shared/interfaces/account.interface";

export type GameT = {
    _id: string;
    multiplier: string;
    betAmount: number;
    totalWinAmount: number;
    currency: Currency;
    createdAt: Date; // Alternatively, use string if dates are not converted
    nonce: number;
    seed: SeedT | string;
}

export type BetHistoryT = {
    _id: string;
    user: string | Partial<UserI>;
    // The gameId field is populated with the game document
    gameId: GameT;
    gameType: GameTypeEnum;
    betAmount: number;
    createdAt: Date;
    updatedAt: Date;
    __v: number;
}

export type SeedT = {
    _id: string;
    clientSeed: string;
    deactivatedAt: Date;
    serverSeedHash: string;
    status: SeedStatus;
    serverSeed?: string;
    createdAt: Date;
}

export enum SeedStatus {
    ACTIVE = 'active',
    DEACTIVATED = 'deactivated',
    PENDING = 'pending',
}