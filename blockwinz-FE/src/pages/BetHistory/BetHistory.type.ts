import { Currency } from "@/shared/enums/currency.enum";
import { GameTypeEnum } from "@/shared/enums/gameType.enum";
import { UserI } from "@/shared/interfaces/account.interface";

/** Populated game document (legacy / some responses) */
export type GameT = {
    _id: string;
    multiplier: string;
    betAmount: number;
    totalWinAmount: number;
    currency: Currency;
    createdAt: Date;
    nonce: number;
    seed: SeedT | string;
}

export type BetHistoryT = {
    /** Bet history row id from API */
    id?: string;
    _id?: string;
    user: string | Partial<UserI>;
    /** Game round id (UUID) from API; legacy responses may embed a game document */
    gameId: string | GameT;
    gameType: GameTypeEnum;
    currency?: Currency;
    multiplier?: number;
    betAmount: number;
    totalWinAmount?: number;
    createdAt: Date | string;
    updatedAt?: Date;
    __v?: number;
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

export function isPopulatedGame(
    gameId: BetHistoryT['gameId'],
): gameId is GameT {
    return typeof gameId === 'object' && gameId != null && 'betAmount' in gameId;
}
