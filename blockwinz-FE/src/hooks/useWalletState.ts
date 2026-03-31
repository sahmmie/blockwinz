/* eslint-disable @typescript-eslint/no-unused-vars */
import { create } from 'zustand';
import { useQuery } from '@tanstack/react-query';
import { CurrencyInfo } from '@/shared/types/core';
import axiosService from '@/lib/axios';
import { currencyIconMap } from '@/shared/utils/gameMaps';
import { DEFAULT_CURRENCY, DEFAULT_ROUNDING_DECIMALS, SUPPORTED_CURRENCIES } from '@/shared/constants/app.constant';
import { Currency, StakeDenomination } from '@blockwinz/shared';
import { reportClientError } from '@/shared/utils/monitoring';

const STAKE_DENOM_KEY = 'blockwinz_stakeDenomination';

function readStoredStakeDenomination(): StakeDenomination {
    try {
        const v = localStorage.getItem(STAKE_DENOM_KEY);
        if (v === StakeDenomination.Usd || v === StakeDenomination.Native) {
            return v as StakeDenomination;
        }
    } catch {
        /* ignore */
    }
    return StakeDenomination.Native;
}

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
    /** SOL wallet: whether bet input is in SOL or USD (persisted) */
    stakeDenomination: StakeDenomination;
    setStakeDenomination: (mode: StakeDenomination) => void;
    /** Exact USD amount for the next USD-denominated SOL bet (authoritative for API usdAmount) */
    solStakeUsdInput: number | null;
    setSolStakeUsdInput: (usd: number | null) => void;
    /**
     * When true, `useWalletQuery` skips interval + focus refetches (multiplayer in-play).
     * Explicit `getWalletData()` still runs — e.g. after `GAME_FINISHED`.
     */
    suppressWalletAutoRefreshDuringMpPlay: boolean;
    setSuppressWalletAutoRefreshDuringMpPlay: (v: boolean) => void;
}

const launchCurrencySet = new Set(SUPPORTED_CURRENCIES.map((c) => c.currency));

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

/** Hide currencies not in SUPPORTED_CURRENCIES (e.g. BWZ until launch). */
const filterLaunchBalances = (balances: CurrencyInfo[]): CurrencyInfo[] =>
    balances.filter((b) => launchCurrencySet.has(b.currency));

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
    stakeDenomination: readStoredStakeDenomination(),
    setStakeDenomination: (mode: StakeDenomination) => {
        try {
            localStorage.setItem(STAKE_DENOM_KEY, mode);
        } catch {
            /* ignore */
        }
        set({ stakeDenomination: mode });
        if (mode === StakeDenomination.Native) {
            set({ solStakeUsdInput: null });
        }
    },
    solStakeUsdInput: null,
    setSolStakeUsdInput: (usd: number | null) => set({ solStakeUsdInput: usd }),
    suppressWalletAutoRefreshDuringMpPlay: false,
    setSuppressWalletAutoRefreshDuringMpPlay: (v: boolean) =>
        set({ suppressWalletAutoRefreshDuringMpPlay: v }),
    prices: {},
    setBalances: (balances: CurrencyInfo[]) =>
        set({ balances: filterLaunchBalances(mapCurrencyToData(balances)) }),
    setSelectedBalance: (currencyInfo: CurrencyInfo) =>
        set({
            selectedBalance: {
                ...currencyInfo
            },
            ...(currencyInfo.currency !== Currency.SOL
                ? {
                      stakeDenomination: StakeDenomination.Native,
                      solStakeUsdInput: null,
                  }
                : {}),
        }),
    setPrices: (prices: Record<string, number>) => set({ prices }),
    getWalletData: async (forceRefresh = false) => {
        try {
            set({ isFetchingForceBalances: true });
            const response = await axiosService.get(`/wallet/balances?forceRefresh=${forceRefresh}`);
            const balances = response.data;
            const balancesWithIcons = filterLaunchBalances(mapCurrencyToData(balances));

            set((state) => ({
                balances: balancesWithIcons,
                selectedBalance:
                    balancesWithIcons.find(balance => balance?.currency === state.selectedBalance?.currency) ||
                    balancesWithIcons.find(balance => balance?.currency === DEFAULT_CURRENCY) ||
                    balancesWithIcons[0] || {
                        availableBalance: 0,
                        currency: foundCurrency?.currency || DEFAULT_CURRENCY,
                        icon: currencyIconMap[foundCurrency?.currency || DEFAULT_CURRENCY],
                        decimals: foundCurrency?.decimals || DEFAULT_ROUNDING_DECIMALS,
                        withdrawalFee: foundCurrency?.withdrawalFee || 0.0,
                    },
            }));

            return balancesWithIcons;
        } catch (error: unknown) {
            reportClientError('wallet-balances', error, { forceRefresh });
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
            reportClientError('token-prices', error);
            return {};
        }
    },
    getTokenPrice: (symbol: string): number => {
        return get().prices[symbol] ?? 0;
    },
}));

export const useWalletQuery = (enabled: boolean = true) => {
    const getWalletData = useWalletState((state) => state.getWalletData);
    const suppressMp = useWalletState(
        (state) => state.suppressWalletAutoRefreshDuringMpPlay,
    );
    return useQuery(
        ['walletData'],
        () => getWalletData(),
        {
            enabled,
            refetchInterval: suppressMp ? false : 60_000,
            refetchOnWindowFocus: !suppressMp,
        },
    );
};

export const useTokenPricesQuery = () => {
    const getTokenPrices = useWalletState((state) => state.getTokenPrices);
    return useQuery(['tokenPrices'], getTokenPrices, {
        refetchInterval: 600000, // 10 minutes
    });
};

export default useWalletState;
