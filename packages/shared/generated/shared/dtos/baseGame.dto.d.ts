import { Currency } from '@blockwinz/shared';
export declare class BaseGameDto {
    _id?: string;
    id?: string;
    user: string;
    betAmount: number;
    currency: Currency;
    nonce: number;
    readonly seed?: string;
    multiplier: number | null;
    betResultNumber?: number | null;
    betResultStatus: string;
    stopOnProfit?: number | null;
    stopOnLoss?: number | null;
    increaseBy?: number | null;
    decreaseBy?: number | null;
    isManualMode?: boolean | null;
    isTurboMode?: boolean | null;
    createdAt?: Date;
    updatedAt?: Date;
    totalWinAmount: number;
}
//# sourceMappingURL=baseGame.dto.d.ts.map