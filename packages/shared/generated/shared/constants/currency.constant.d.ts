import { currencyInfoDto } from 'src/wallet/dtos/currencyInfo.dto';
import { Currency } from '@blockwinz/shared';
type CurrencyData = {
    minAmount: number;
    maxBet: number;
    maxProfit: number;
    decimals: number;
    currency: string;
    minWithdrawalAmount: number;
    autoWithdrawalAmount: number;
};
export declare const currencyData: Record<Currency, CurrencyData>;
export declare const defaultCurrencyData: currencyInfoDto;
export {};
//# sourceMappingURL=currency.constant.d.ts.map