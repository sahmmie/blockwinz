import { Currency } from '@blockwinz/shared';
export declare class CommonGameRequestDto {
    betAmount: number;
    currency: Currency;
    stopOnProfit?: number;
    stopOnLoss?: number;
    increaseBy?: number;
    decreaseBy?: number;
    isManualMode?: boolean;
    isTurboMode?: boolean;
    readonly seed?: string;
}
export declare abstract class SpecificGameRequestDto extends CommonGameRequestDto {
}
//# sourceMappingURL=gameRequest.dto.d.ts.map