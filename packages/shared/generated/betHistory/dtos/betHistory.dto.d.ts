import { DbGameSchema } from '@blockwinz/shared';
export declare class BetHistoryDto {
    id: string;
    user: string;
    gameId: string;
    gameType: DbGameSchema;
    currency: string;
    multiplier?: number;
    betAmount: number;
    totalWinAmount?: number;
    createdAt?: Date;
}
//# sourceMappingURL=betHistory.dto.d.ts.map