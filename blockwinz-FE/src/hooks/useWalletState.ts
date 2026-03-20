/* eslint-disable @typescript-eslint/no-unused-vars */
import { create } from 'zustand';
import { useQuery } from '@tanstack/react-query';
import { CurrencyInfo } from '@/shared/types/core';
import axiosService from '@/lib/axios';
import { currencyIconMap } from '@/shared/utils/gameMaps';
import { DEFAULT_CURRENCY, DEFAULT_ROUNDING_DECIMALS, SUPPORTED_CURRENCIES } from '@/shared/constants/app.constant';

interface TokenPrice {
    symbol: string;
    price: number;
    dev?: boolean;
    last_updated_at?: number;
}

interface WalletStoreI {
    balances: CurrencyInfo[];
    selectedBalance: CurrencyInfo;
    isFetchingForceBalances: boolean;
    setBalances: (balances: CurrencyInfo[]) => void;
    setSelectedBalance: (currencyInfo: CurrencyInfo) => void;
    getWalletData: (forceRefresh?: boolean) => Promise<CurrencyInfo[]>;
    prices: Record<string, number>;
    setPrices: (prices: Record<string, number>) => void;
    getTokenPrices: () => Promise<Record<string, number>>;
    getTokenPrice: (symbol: string) => number;
}

const mapCurrencyToData = (currencies: CurrencyInfo[]): CurrencyInfo[] => {
    return currencies.map((currency) => {
        const currencyIcon = currencyIconMap[currency.currency];
        return {
            ...currency,
            icon: currencyIcon,
            decimals: SUPPORTED_CURRENCIES.find(c => c.currency === currency.currency)?.decimals || DEFAULT_ROUNDING_DECIMALS,
            withdrawalFee: SUPPORTED_CURRENCIES.find(c => c.currency === currency.currency)?.withdrawalFee || 0.0,
        };
    });
};

const foundCurrency = SUPPORTED_CURRENCIES.find(
    c => c.currency === DEFAULT_CURRENCY,
);

const useWalletState = create<WalletStoreI>((set, get) => ({
    isFetchingForceBalances: false,
    balances: [],
    selectedBalance: {
        availableBalance: 0,
        currency: foundCurrency?.currency || DEFAULT_CURRENCY,
        icon: currencyIconMap[foundCurrency?.currency || DEFAULT_CURRENCY],
        decimals: foundCurrency?.decimals || DEFAULT_ROUNDING_DECIMALS,
        withdrawalFee: foundCurrency?.withdrawalFee || 0.0,
    },
    prices: {},
    setBalances: (balances: CurrencyInfo[]) =>
        set({ balances: mapCurrencyToData(balances) }),
    setSelectedBalance: (currencyInfo: CurrencyInfo) =>
        set({
            selectedBalance: {
                ...currencyInfo
            }
        }),
    setPrices: (prices: Record<string, number>) => set({ prices }),
    getWalletData: async (forceRefresh = false) => {
        try {
            set({ isFetchingForceBalances: true });
            const response = await axiosService.get(`/wallet/balances?forceRefresh=${forceRefresh}`);
            const balances = response.data;
            const balancesWithIcons = mapCurrencyToData(balances);

            set((state) => ({
                balances: balancesWithIcons,
                selectedBalance: balancesWithIcons.find(balance => balance?.currency === state.selectedBalance?.currency) ||
                    balancesWithIcons.find(balance => balance?.currency === DEFAULT_CURRENCY) ||
                    balancesWithIcons[0],
            }));

            return balancesWithIcons;
        } catch (error: unknown) {
            return [];
        }
        finally {
            set({ isFetchingForceBalances: false });
        }
    },
    getTokenPrices: async () => {
        try {
            const response = await axiosService.get('/price');
            const pricesArr: TokenPrice[] = response.data;
            const prices: Record<string, number> = {};
            pricesArr.forEach(token => {
                prices[token.symbol] = token.price;
            });
            set({ prices });
            return prices;
        } catch (error) {
            return {};
        }
    },
    getTokenPrice: (symbol: string): number => {
        return get().prices[symbol] ?? 0;
    },
}));

export const useWalletQuery = () => {
    const getWalletData = useWalletState((state) => state.getWalletData);
    return useQuery(
        ['walletData'],
        () => getWalletData(),
        {
            refetchInterval: 60000, // Poll every 1 minute
        }
    );
}

export const useTokenPricesQuery = () => {
    const getTokenPrices = useWalletState((state) => state.getTokenPrices);
    return useQuery(['tokenPrices'], getTokenPrices, {
        refetchInterval: 600000, // 10 minutes
    });
};

export default useWalletState;
