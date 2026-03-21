/* eslint-disable @typescript-eslint/no-unused-expressions */
import { getNewTagGroupItem, TagGroupItem } from '@/components/TagGroup'
import axiosInstance from '@/lib/axios'
import { MAX_TAG_RESULTS } from '@/shared/constants/validation'
import { Currency, StakeDenomination } from '@blockwinz/shared'
import { BaseBetRequest, BaseBetResponse, BetStatus, GameState, SpeedTypes } from '@/shared/types/core'
import { calculateNewBetAmount, getCurrencyMax, getDelayBeforeNextBet } from '@/shared/utils/common'
import { useMutation } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'
import { ExtendedGameState, PartialEGS, StateUpdater, UseGameStateProps } from '../shared/types/types'
import { useDebounce } from './useDebounce'
import { useStrategies } from './useStrategies'
import useWalletState from './useWalletState'
import { GameMode } from '@blockwinz/shared'
import { DEFAULT_ROUNDING_DECIMALS } from '@/shared/constants/app.constant'
import { useSettingsStore } from '@/hooks/useSettings'
import { toaster } from '@/components/ui/toaster'

/** USD stake for API when in USD mode: prefer store, else derive from SOL × price. */
function resolvedUsdStakeAmount(
  betAmountStr: string,
  solStakeUsdInput: number | null,
  priceSol: number,
): number {
  const solAmt = parseFloat(betAmountStr) || 0
  let usdRaw = 0
  if (
    solStakeUsdInput != null &&
    Number.isFinite(solStakeUsdInput) &&
    solStakeUsdInput > 0
  ) {
    usdRaw = solStakeUsdInput
  } else if (priceSol > 0 && solAmt > 0) {
    usdRaw = solAmt * priceSol
  }
  return Math.round(usdRaw * 100) / 100
}

export const AUTOBET_DEBOUNCE_DELAY = 500

export const useGameState = <
  T extends GameState,
  R extends BaseBetRequest,
  S extends BaseBetResponse
>({
  initialState = {} as ExtendedGameState<T, R, S>,
  betEndpoint,
  onBetRequest,
  onAnimFinish,
  onBetResult,
  deferAutobetContinue = false,
}: UseGameStateProps<T, R, S>) => {
  type EGS = ExtendedGameState<T, R, S>
  type PEGS = PartialEGS<T, R, S>
  const { selectedBalance } = useWalletState()
  const ROUNDING_DECIMALS = selectedBalance?.decimals || DEFAULT_ROUNDING_DECIMALS;

  const [state, setState] = useState<EGS>({
    mode: GameMode.Manual,
    betAmount: '0.00',
    profitOnWin: '0.00',
    onWinIncrease: 0,
    onLossIncrease: 0,
    stopOnProfit: '0.00',
    stopOnLoss: '0.00',
    numberOfBets: 0,
    isAutoBetting: false,
    isMute: false,
    animSpeed: 500,
    delayBeforeNextAutoBet: 500,
    delayBeforeNextBet: 0,
    zeroBetDelay: 100,
    animNormalSpeed: 500,
    animTurboSpeed: 150,
    animInstantSpeed: 10,
    speedType: SpeedTypes.NORMAL,
    isAnimating: false,
    tagResults: [] as TagGroupItem[],
    waitForAnimation: false,
    onWinReset: true,
    onLossReset: true,
    ...initialState,
  } as EGS)

  const [initialBetAmount, setInitialBetAmount] = useState(parseFloat(state.betAmount))
  const isAutoBettingRef = useRef(false)
  const isBettingRef = useRef(false)
  const autoBetTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const totalProfitRef = useRef(0)
  const totalBetsRef = useRef(0)
  const { actions: strategyActions, state: strategyState } = useStrategies()

  const updateState = (updates: PEGS | StateUpdater<PEGS>) => {
    setState((prevState) => ({
      ...prevState,
      ...(typeof updates === 'function' ? updates(prevState) : updates),
    }))
  }

  const addNewTagResult = (result: number, isBetWon: boolean) => {
    const newTagResult = getNewTagGroupItem(result, isBetWon)
    const newTagResults = [...state.tagResults, newTagResult].slice(-MAX_TAG_RESULTS)

    updateState({ tagResults: newTagResults } as EGS)
  }

  const toggleMode = (mode: string) => updateState({ mode } as EGS)

  const handleBetAmountChange = (value: string) => updateState({ betAmount: value } as EGS)

  const handleProfitOnWinChange = (value: string) => updateState({ profitOnWin: value } as EGS)

  const handleOnWinIncreaseChange = (value: number) => updateState({ onWinIncrease: value } as EGS)

  const handleOnLossIncreaseChange = (value: number) =>
    updateState({ onLossIncrease: value } as EGS)

  const handleNumberOfBetsChange = (value: number = 0) => {
    if (isNaN(value)) {
      updateState({ numberOfBets: 0 } as EGS)
    } else {
      updateState({ numberOfBets: value } as EGS)
    }
  }

  const handleStopOnProfitChange = (value: string) => updateState({ stopOnProfit: value } as EGS)

  const handleStopOnLossChange = (value: string) => updateState({ stopOnLoss: value } as EGS)

  const resetOnWin = (value: boolean) => updateState({ onWinReset: value, onWinIncrease: 0 } as EGS)

  const resetOnLoss = (value: boolean) =>
    updateState({ onLossReset: value, onLossIncrease: 0 } as EGS)

  const setIsAnimating = (value: boolean) => updateState({ isAnimating: value } as EGS)

  const setAnimSpeed = (value: number) => updateState({ animSpeed: value } as EGS)

  const setDelayBeforeNextAutoBet = (value: number) =>
    updateState({ delayBeforeNextAutoBet: value } as EGS)

  const latestStateRef = useRef(state)
  latestStateRef.current = state

  const onBetResultRef = useRef(onBetResult)
  onBetResultRef.current = onBetResult
  const onAnimFinishRef = useRef(onAnimFinish)
  onAnimFinishRef.current = onAnimFinish

  useEffect(() => {
    return () => {
      if (autoBetTimeoutRef.current) {
        clearTimeout(autoBetTimeoutRef.current)
        isAutoBettingRef.current = false
      }
    }
  }, [])

  useEffect(() => {
    switch (state.speedType) {
      case SpeedTypes.NORMAL:
        setAnimSpeed(state.animNormalSpeed)
        break
      case SpeedTypes.TURBO:
        setAnimSpeed(state.animTurboSpeed)
        break
      case SpeedTypes.INSTANT:
        setAnimSpeed(state.animInstantSpeed)
        break
    }
  }, [state.speedType])

  const adjustBetAmount = (result: BetStatus) => {
    if (state.mode === 'manual') return

    setState((prevState) => {
      const currentBetAmount = parseFloat(prevState.betAmount)
      let newBetAmount: number
      if (prevState.mode === 'advanced') {
        newBetAmount = strategyActions.getNextBetAmount(currentBetAmount, result)
      } else if (prevState.mode === 'manual') {
        newBetAmount = currentBetAmount
      } else {
        const adjustmentPercentage =
          result === BetStatus.WIN ? prevState.onWinIncrease : prevState.onLossIncrease
        const resetAmount = result === BetStatus.WIN ? prevState.onWinReset : prevState.onLossReset
        newBetAmount = calculateNewBetAmount(
          currentBetAmount,
          adjustmentPercentage,
          initialBetAmount,
          resetAmount
        )
      }

      return { ...prevState, betAmount: newBetAmount.toFixed(ROUNDING_DECIMALS) } as EGS
    })
  }

  const debouncedStartAutoBet = useDebounce(
    () => {
      if (state.mode == 'manual') return
      if (autoBetTimeoutRef.current) clearTimeout(autoBetTimeoutRef.current)
      totalBetsRef.current = 0
      totalProfitRef.current = 0
      setInitialBetAmount(parseFloat(state.betAmount))
      updateState({ isAutoBetting: true } as EGS)

      if (state.mode === 'advanced') {
        strategyActions.setInitialBetAmount(parseFloat(state.betAmount))
      }
    },
    AUTOBET_DEBOUNCE_DELAY,
    {
      leading: true,
      trailing: false,
    }
  )

  const startAutoBet = () => {
    debouncedStartAutoBet()
  }

  const stopAutoBet = () => {
    if (autoBetTimeoutRef.current) clearTimeout(autoBetTimeoutRef.current)
    const numberOfBetsLeft = Math.max(0, state.numberOfBets - totalBetsRef.current)
    totalBetsRef.current = 0
    totalProfitRef.current = 0
    updateState({ isAutoBetting: false, numberOfBets: numberOfBetsLeft } as EGS)
  }

  useEffect(() => {
    isAutoBettingRef.current = state.isAutoBetting
    if (state.isAutoBetting) {
      handleBet()
    } else {
      totalProfitRef.current = 0
      totalBetsRef.current = 0
      if (autoBetTimeoutRef.current) clearTimeout(autoBetTimeoutRef.current)
    }
  }, [state.isAutoBetting])

  const { mutateAsync: placeBet, isLoading: isPlacingBet } = useMutation(
    async (betData: BaseBetRequest) => {
      const response = await axiosInstance.post<S>(betEndpoint, betData)
      return response.data
    },
    {
      onSuccess: (data) => {
        const curr = latestStateRef.current as EGS
        onBetResultRef.current(curr, data)
        updateState({ ...data } as EGS)
        setIsAnimating(true)

        const delayBeforeNextBet = getDelayBeforeNextBet(
          latestStateRef.current as unknown as ExtendedGameState<GameState, BaseBetRequest, BaseBetResponse>
        )
        setTimeout(() => onAnimFinishRef.current?.(latestStateRef.current as EGS, data), curr.animSpeed)
        setTimeout(() => setIsAnimating(false), delayBeforeNextBet)
      },
      onError: (error) => {
        throw error
      },
    }
  )

  const createBetRequest = (): BaseBetRequest => {
    const currState = latestStateRef.current
    const profileTurbo = !!useSettingsStore.getState().settings.isTurbo
    const currency = selectedBalance?.currency as Currency
    const { stakeDenomination, solStakeUsdInput, getTokenPrice } =
      useWalletState.getState()
    const partial = {
      isManualMode: currState.mode === 'manual',
      isTurboMode: currState.speedType === SpeedTypes.TURBO || profileTurbo,
      stopOnProfit: parseFloat(currState.stopOnProfit),
      stopOnLoss: parseFloat(currState.stopOnLoss),
      increaseBy: currState.onWinIncrease,
      decreaseBy: currState.onLossIncrease,
      currency,
      ...onBetRequest(currState),
    }
    if (currency === Currency.SOL && stakeDenomination === StakeDenomination.Usd) {
      const priceSol = getTokenPrice('SOL')
      const usdAmount = resolvedUsdStakeAmount(
        currState.betAmount,
        solStakeUsdInput,
        priceSol,
      )
      return {
        ...partial,
        betAmount: 0,
        usdAmount,
        stakeDenomination: StakeDenomination.Usd,
      } as BaseBetRequest
    }
    return {
      ...partial,
      betAmount: parseFloat(currState.betAmount),
      stakeDenomination: StakeDenomination.Native,
    } as BaseBetRequest
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleBetResult = (result: any) => {
    if (result.betResultStatus === BetStatus.WIN) {
      totalProfitRef.current += parseFloat(latestStateRef.current.profitOnWin)
    } else {
      totalProfitRef.current -= parseFloat(latestStateRef.current?.betAmount)
    }

    adjustBetAmount(result.handleBetResult)
  }

  const shouldStopAutoBetting = (): boolean => {
    const s = latestStateRef.current
    const stopOnProfit = parseFloat(s.stopOnProfit)
    const stopOnLoss = parseFloat(s.stopOnLoss)

    return (
      !isAutoBettingRef.current ||
      (stopOnProfit > 0 && totalProfitRef.current >= stopOnProfit) ||
      (stopOnLoss > 0 && totalProfitRef.current <= -stopOnLoss) ||
      (s.numberOfBets !== 0 && totalBetsRef.current >= s.numberOfBets)
    )
  }

  const continueAutoBetting = () => {
    totalBetsRef.current++
    if (shouldStopAutoBetting()) {
      totalBetsRef.current = 0
      updateState({ isAutoBetting: false, numberOfBets: 0 } as EGS)
    } else {
      const delayBeforeNextBet = getDelayBeforeNextBet(
        latestStateRef.current as unknown as ExtendedGameState<GameState, BaseBetRequest, BaseBetResponse>
      )
      autoBetTimeoutRef.current = setTimeout(() => {
        handleBet()
      }, delayBeforeNextBet)
    }
  }

  const signalRoundComplete = () => {
    if (!deferAutobetContinue || !isAutoBettingRef.current) return
    continueAutoBetting()
  }

  const handleBet = async () => {
    if (isBettingRef.current) return

    const currState = latestStateRef.current
    const currency = selectedBalance?.currency as Currency
    const { stakeDenomination, solStakeUsdInput, getTokenPrice } =
      useWalletState.getState()
    if (currency === Currency.SOL && stakeDenomination === StakeDenomination.Usd) {
      const usd = resolvedUsdStakeAmount(
        currState.betAmount,
        solStakeUsdInput,
        getTokenPrice('SOL'),
      )
      if (usd > 0 && usd < 1) {
        toaster.create({
          title: 'Minimum USD stake is $1',
          description: 'Use $0 for a free round, or enter at least $1.',
          type: 'warning',
        })
        return
      }
    }

    try {
      isBettingRef.current = true
      const betRequest = createBetRequest()
      const result = await placeBet(betRequest)

      handleBetResult(result)
      isBettingRef.current = false

      if (isAutoBettingRef.current && !deferAutobetContinue) {
        continueAutoBetting()
      }
    } catch (error) {
      updateState({ isAutoBetting: false } as EGS)
      totalBetsRef.current = 0
      setIsAnimating(false)
      isBettingRef.current = false
      throw error
    }
  }

  const startBetting = () => {
    if (state.mode === GameMode.Manual) {
      handleBet()
    } else {
      state.isAutoBetting ? stopAutoBet() : startAutoBet()
    }
  }

  const halveBetAmount = () => {
    const currency = selectedBalance?.currency as Currency
    const { stakeDenomination, getTokenPrice, setSolStakeUsdInput } =
      useWalletState.getState()
    if (currency === Currency.SOL && stakeDenomination === StakeDenomination.Usd) {
      const price = getTokenPrice('SOL')
      if (!price) return
      const sol = parseFloat(state.betAmount)
      const usd =
        (useWalletState.getState().solStakeUsdInput ?? sol * price) / 2
      setSolStakeUsdInput(usd)
      handleBetAmountChange((usd / price).toFixed(ROUNDING_DECIMALS))
      return
    }
    const newAmount = (parseFloat(state.betAmount) / 2).toFixed(ROUNDING_DECIMALS)
    handleBetAmountChange(newAmount)
  }

  const doubleBetAmount = () => {
    const currency = selectedBalance?.currency as Currency
    const { stakeDenomination, getTokenPrice, setSolStakeUsdInput } =
      useWalletState.getState()
    if (currency === Currency.SOL && stakeDenomination === StakeDenomination.Usd) {
      const price = getTokenPrice('SOL')
      if (!price) return
      const sol = parseFloat(state.betAmount)
      const usd = (useWalletState.getState().solStakeUsdInput ?? sol * price) * 2
      const maxSol = selectedBalance?.availableBalance || 0
      const maxUsd = maxSol * price
      const cappedUsd = Math.min(usd, maxUsd)
      const currMaxSol = getCurrencyMax(selectedBalance?.currency as Currency, 'bet')
      const cappedUsd2 = Math.min(cappedUsd, currMaxSol * price)
      setSolStakeUsdInput(cappedUsd2)
      handleBetAmountChange((cappedUsd2 / price).toFixed(ROUNDING_DECIMALS))
      return
    }
    let newAmount = parseFloat(state.betAmount) * 2
    newAmount = Math.min(newAmount, selectedBalance?.availableBalance || 0)
    const currMax = getCurrencyMax(selectedBalance?.currency as Currency, 'bet')
    newAmount = Math.min(newAmount, currMax)
    handleBetAmountChange(newAmount.toFixed(ROUNDING_DECIMALS))
  }

  return {
    state: {
      ...state,
      ...strategyState,
      // Override number of bets with the actual number of remaining bets
      numberOfBets: Math.max(0, state.numberOfBets - totalBetsRef.current),
      isPlacingBet,
    },
    actions: {
      toggleMode,
      handleBetAmountChange,
      handleProfitOnWinChange,
      handleOnWinIncreaseChange,
      handleOnLossIncreaseChange,
      setIsAnimating,
      handleStopOnProfitChange,
      handleNumberOfBetsChange,
      handleStopOnLossChange,
      resetOnWin,
      resetOnLoss,
      handleBet,
      startAutoBet,
      stopAutoBet,
      setAnimSpeed,
      setDelayBeforeNextAutoBet,
      updateState,
      addNewTagResult,
      startBetting,
      halveBetAmount,
      doubleBetAmount,
      signalRoundComplete,
      isLoading: state.isAutoBetting || isPlacingBet || state.isAnimating,
      ...strategyActions,
    },
  }
}
