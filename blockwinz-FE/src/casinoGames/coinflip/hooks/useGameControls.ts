import { useBetAmount, useProfitAmount } from '@/hooks/useBetAmount';
import { useGameState } from '@/hooks/useGameState';
import useWalletState from '@/hooks/useWalletState';
import { DEFAULT_ROUNDING_DECIMALS } from '@/shared/constants/app.constant';
import { getCoinFlipProfitOnWin } from '@/casinoGames/coinflip/utils/payoutMultiplier';
import { useSound } from './useSound';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSettingsStore } from '@/hooks/useSettings';
import { GameRenderer } from '@/casinoGames/coinflip/components/Renderer/GameRenderer';
import { useMaxProfit } from './useMaxProfit';
import {
    CoinFlipBetRequest,
    CoinFlipBetResponse,
    CoinFlipGameState,
    findPreset,
    presets,
    type Preset,
} from '@/casinoGames/coinflip/types';
import { BetStatus } from '@/shared/types/core';

// type EP = CoinFlipGameState & CoinFlipBetRequest & CoinFlipBetResponse;

export const useGameControls = () => {
    const { getWalletData, selectedBalance } = useWalletState();
    const ROUNDING_DECIMALS =
        selectedBalance?.decimals || DEFAULT_ROUNDING_DECIMALS;
    const { state, actions } = useGameState<CoinFlipGameState, CoinFlipBetRequest, CoinFlipBetResponse>({
        initialState: {
            animSpeed: 50,
            animNormalSpeed: 50,
            animTurboSpeed: 50,
            coins: presets[0].coins,
            min: presets[0].min,
            coinType: 1,
            multiplier: -1,
            results: [],
            delayBeforeNextAutoBet: 50,
            forceUpdater: '',
            prevResults: [],
            status: BetStatus.LOSE,
        },
        onBetRequest: (currState) => {
            play('startBet', settings?.isMuted === true)
            return {
                coins: currState.coins,
                min: currState.min,
                coinType: currState.coinType,
            }
        },
        onBetResult: (_, res: CoinFlipBetResponse) => {
            actions.updateState({
                multiplier: res.multiplier,
                results: res.results,
                status: res.betResultStatus,
                forceUpdater: Math.random().toString(),
            })
            isSpinningRef.current = false
        },
        onAnimFinish: () => {
            getWalletData()
        },
        betEndpoint: '/coinflip',
    })

    const { play } = useSound();
    const { settings } = useSettingsStore();

    const isMutedRef = useRef<boolean>(settings.isMuted ?? false);
    const coinsRef = useRef<number>(state.coins);
    const minRef = useRef<number>(state.min);
    const coinTypeRef = useRef<number>(state.coinType);
    const isSpinningRef = useRef<boolean>(false);

    const onResults = useCallback(
        (_results: number[], multiplier: number, status: BetStatus) => {
            let clr = '#10101D';
            if (status === BetStatus.WIN) {
                const goldClr = '#ffce1d';
                const silverClr = '#d4d4d4';
                clr = coinTypeRef.current === 0 ? goldClr : silverClr;
            }
            const newResult = {
                value: multiplier,
                clr,
                fontClr: multiplier > 0 ? 'black' : 'white',
                uid: Math.random().toString(),
            };
            actions.updateState((prevState) => ({
                prevResults: [newResult, ...(prevState.prevResults || [])].slice(0, 5),
            }));
        },
        [actions, coinTypeRef]
    );

    const [gameRendererInited, setGameRendererInited] = useState<boolean>(false);
    const gameRendererRef = useRef<GameRenderer | null>(null);

    const { betAmountErrors } = useBetAmount(state.betAmount.toString());
    const profitAmountState = useProfitAmount(state.profitOnWin);

    useEffect(() => {
        const stake = parseFloat(state.betAmount);
        const profit = getCoinFlipProfitOnWin(
            Number.isFinite(stake) ? stake : 0,
            state.coins,
            state.min,
        );
        actions.handleProfitOnWinChange(profit.toFixed(ROUNDING_DECIMALS));
    }, [state.betAmount, state.coins, state.min, ROUNDING_DECIMALS]);

    /** Value for the preset select when (coins, min) matches a row; `null` shows placeholder “Custom”. */
    const selectedPresetValue = useMemo(() => {
        const match = findPreset(state.coins, state.min);
        return match ? `${state.coins}:${state.min}` : null;
    }, [state.coins, state.min]);

    useEffect(() => {
        gameRendererRef.current?.setTurbo(!!settings.isTurbo);
    }, [settings.isTurbo]);

    useEffect(() => {
        if (state.multiplier === -1) return;
        gameRendererRef.current?.setOnResults(onResults);
        gameRendererRef.current?.get(
            state.results,
            state.multiplier,
            state.status
        );
    }, [state.forceUpdater]);

    useEffect(() => {
        gameRendererRef.current = new GameRenderer(state.coins, state.min, state.coinType);
        setGameRendererInited(true);
    }, []);

    useEffect(() => {
        gameRendererRef.current?.update(state.coins, state.min, state.coinType);
    }, [state.coins, state.min, state.coinType]);

    useEffect(() => {
        coinsRef.current = state.coins;
        minRef.current = state.min;
    }, [state.coins, state.min]);

    useEffect(() => {
        isMutedRef.current = settings.isMuted ?? false;
    }, [settings.isMuted]);

    const { betAmount } = state;
    const { maxProfitErrors } = useMaxProfit(parseFloat(betAmount), 10000);

    const coinsOptions = useMemo(() =>
        Array.from({ length: 10 }, (_, i) => ({ value: i + 1, label: 'x' + (i + 1).toString() })),
        []);

    const minOptions = useMemo(() => {
        const coins = state.coins;
        let start = 1;
        if (coins >= 9) start = 3;
        else if (coins >= 6) start = 2;
        return Array.from({ length: coins - start + 1 }, (_, i) => ({
            value: i + start,
            label: 'x' + (i + start).toString(),
        }));
    }, [state.coins]);

    const handleCoinsChange = (newCoins: number) => {
        if (isSpinningRef.current) return;
        coinsRef.current = newCoins;
        actions.updateState({ coins: newCoins });

        if (newCoins < 6 && minRef.current > newCoins)
            handleMinChange(newCoins);
        else if (newCoins >= 6 && newCoins < 9 && minRef.current < 2)
            handleMinChange(2);
        else if (newCoins >= 9 && minRef.current < 3)
            handleMinChange(3);
    };

    const handleMinChange = (newMin: number) => {
        if (isSpinningRef.current) return;
        minRef.current = newMin;
        actions.updateState({ min: newMin });
    };

    /**
     * Applies a saved preset in one update so min/coins rules do not clamp mid-way (e.g. 10:10).
     */
    const applyPreset = (preset: Preset) => {
        if (isSpinningRef.current) return;
        coinsRef.current = preset.coins;
        minRef.current = preset.min;
        actions.updateState({ coins: preset.coins, min: preset.min });
    };

    const handlePresetChange = (value: string) => {
        const [c, m] = value.split(':').map(Number);
        const preset = findPreset(c, m);
        if (preset) applyPreset(preset);
    };

    const handleCoinTypeChange = (newType: number) => {
        if (isSpinningRef.current || (newType != 0 && newType != 1)) return;
        coinTypeRef.current = newType;
        actions.updateState({ coinType: newType });
    };

    const increaseCoins = () => {
        if (isSpinningRef.current) return;
        const newCoins = Math.min((coinsRef.current || 1) + 1, 10);
        handleCoinsChange(newCoins);
    };

    const decreaseCoins = () => {
        if (isSpinningRef.current) return;
        const newCoins = Math.max((coinsRef.current || 10) - 1, 1);
        handleCoinsChange(newCoins);
    };

    return {
        ...state,
        ...actions,
        isSpinning: isSpinningRef.current,
        betAmountErrors,
        ...profitAmountState,
        selectedPresetValue,
        handlePresetChange,
        maxProfitErrors,
        gameRendererInited,
        gameRendererRef,
        increaseCoins,
        decreaseCoins,
        handleCoinsChange,
        handleMinChange,
        handleCoinTypeChange,
        minOptions,
        coinsOptions,
    };
};

export default useGameControls;

