import {
  Currency,
  GameTypeEnum,
  SeedStatus,
} from "@blockwinz/shared";
import { UserI } from "@/shared/interfaces/account.interface";

export { SeedStatus };

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
    /** From GET /bet-history/:id — joined from game + seeds */
    clientSeed?: string;
    nonce?: number;
    serverSeedHash?: string;
    serverSeed?: string;
    seedStatus?: string;
    /** From GET /bet-history/:id for Coin Flip — provably fair verify prefill */
    coinflipCoins?: number;
    coinflipMin?: number;
    coinflipSide?: number;
    coinflipResults?: number[];
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

export function isPopulatedGame(
    gameId: BetHistoryT['gameId'],
): gameId is GameT {
    return typeof gameId === 'object' && gameId != null && 'betAmount' in gameId;
}
