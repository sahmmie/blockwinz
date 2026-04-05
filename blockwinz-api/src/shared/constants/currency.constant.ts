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

// SIMPLIFY THIS so we can jus
export const currencyData: Record<Currency, CurrencyData> = {
  [Currency.SOL]: {
    minAmount: 0.0001,
    maxBet: 100000.0,
    maxProfit: 100000.0,
    decimals: 0,
    currency: Currency.SOL,
    minWithdrawalAmount: 0.0001,
    autoWithdrawalAmount: 1,
  },
  [Currency.BWZ]: {
    minAmount: 0.0001,
    maxBet: 100000.0,
    maxProfit: 100000.0,
    decimals: 0,
    currency: Currency.BWZ,
    minWithdrawalAmount: 1,
    autoWithdrawalAmount: 10000,
  },
  [Currency.USDT]: {
    minAmount: 0.01,
    maxBet: 10000.0,
    maxProfit: 100000.0,
    decimals: 6,
    currency: Currency.USDT,
    minWithdrawalAmount: 1,
    autoWithdrawalAmount: 1000,
  },
};

export const defaultCurrencyData: currencyInfoDto = {
  decimals: 0,
  currency: Currency.BWZ,
  amount: 0,
};
