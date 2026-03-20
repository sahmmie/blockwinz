/* eslint-disable @typescript-eslint/no-unused-expressions */
import { useMutation } from '@tanstack/react-query'
import { useEffect, useReducer, useRef } from 'react'
import { Action, KenoGameState, PercentageInputToggleButtonType, Risk } from '../types/kenoTypes'

import { postBetRequest } from '../api/requests'
import { toaster } from '@/components/ui/toaster'
import { useSettingsStore } from '@/hooks/useSettings'
import { KenoBetRequest, KenoBetResponse } from '../api/types'
import useWalletState from '@/hooks/useWalletState'
import { useSound } from './useSound'
import { asyncDelay, parseFloatValue } from '@/shared/utils/common'
import { useBetAmount } from '@/hooks/useBetAmount'
import { Currency } from '@/shared/enums/currency.enum'
import { GameMode } from '@/shared/enums/gameMode.enum'
import { currencyMaxTable } from '@/shared/constants/validation'

const initialState: KenoGameState = {
  selectedNumbers: [],
  typeOfPlay: GameMode.Manual,
  betAmount: 0,
  riskDropdownValue: 'classic',
  numberOfBetsValue: '0',
  onWinValue: 0,
  onLossValue: 0,
  stopOnProfit: '0.00',
  onLossToggleValue: 'reset',
  onWinToggleValue: 'reset',
  stopOnLoss: '0.00',
  isAutoPicking: false,
  isAutoBetting: false,
  isBetting: false,
  betResponse: {
    balance: 0,
    status: 'loss',
    multiplier: 0,
    result: [],
    hits: 0,
    totalWinAmount: 0,
  } as KenoBetResponse,
  showMaxProfitModal: false,
}

const updateSelectedNumbers = (selectedNumbers: number[], payload: number): number[] => {
  if (selectedNumbers.includes(payload)) {
    return selectedNumbers.filter((n) => n !== payload)
  } else if (selectedNumbers.length < 10) {
    return [...selectedNumbers, payload]
  } else {
    return selectedNumbers
  }
}

const generateUniqueRandomNumbers = (exclude: Set<number>): number[] => {
  const numbers = new Set<number>(exclude)

  while (numbers.size < 10) {
    const randomNumber = Math.floor(Math.random() * 40) + 1
    numbers.add(randomNumber)
  }

  return Array.from(numbers)
}

const gameReducer = (state: KenoGameState, action: Action): KenoGameState => {
  switch (action.type) {
    case 'SELECT_NUMBER':
      return {
        ...state,
        selectedNumbers: updateSelectedNumbers(state.selectedNumbers, action.payload),
      }
    case 'SET_SELECTED_NUMBERS':
      return { ...state, selectedNumbers: action.payload }
    case 'CLEAR_NUMBERS':
      return { ...state, selectedNumbers: [], betResponse: { ...state.betResponse, result: [] } }
    case 'SET_TYPE_OF_PLAY':
      return { ...state, typeOfPlay: action.payload }
    case 'SET_BET_AMOUNT':
      return { ...state, betAmount: action.payload }
    case 'SET_RISK_DROPDOWN_VALUE':
      return { ...state, riskDropdownValue: action.payload }
    case 'SET_NUMBER_OF_BETS_VALUE':
      return { ...state, numberOfBetsValue: action.payload }
    case 'SET_ON_WIN_VALUE':
      return { ...state, onWinValue: action.payload }
    case 'SET_ON_LOSS_VALUE':
      return { ...state, onLossValue: action.payload }
    case 'SET_STOP_ON_PROFIT':
      return { ...state, stopOnProfit: action.payload }
    case 'SET_STOP_ON_LOSS':
      return { ...state, stopOnLoss: action.payload }
    case 'SET_IS_AUTO_PICKING':
      return { ...state, isAutoPicking: action.payload }
    case 'SET_IS_AUTO_BETTING':
      return { ...state, isAutoBetting: action.payload }
    case 'ADD_RESULT_NUMBER':
      return {
        ...state,
        betResponse: {
          ...state.betResponse,
          result: [...state.betResponse.result, action.payload],
        },
      }
    case 'RESET_RESULT_NUMBERS':
      return { ...state, betResponse: { ...state.betResponse, result: [] } }
    case 'SET_BET_RESPONSE':
      return { ...state, betResponse: action.payload }
    case 'CLEAR_BET_RESPONSE':
      return { ...state, betResponse: initialState.betResponse }
    case 'SET_IS_BETTING':
      return { ...state, isBetting: action.payload }
    case 'SET_ON_LOSS_TOGGLE_VALUE':
      return { ...state, onLossToggleValue: action.payload }
    case 'SET_ON_WIN_TOGGLE_VALUE':
      return { ...state, onWinToggleValue: action.payload }
    case 'SET_SHOW_MAX_PROFIT_MODAL':
      return { ...state, showMaxProfitModal: action.payload }
    default:
      return state
  }
}

export { gameReducer, initialState }

const useKenoState = () => {
  const [state, dispatch] = useReducer<React.Reducer<KenoGameState, Action>>(
    gameReducer,
    initialState
  )

  const { selectedBalance, getWalletData } = useWalletState()
  const {
    settings: { isMuted, isTurbo },
  } = useSettingsStore()

  const isAutoBettingRef = useRef(false)
  const isBettingRef = useRef(false)
  const totalProfitRef = useRef(0)
  const betAmountRef = useRef(state.betAmount)
  const initialBetAmount = useRef(state.betAmount)

  const { play, playAudioSequence } = useSound()

  const isAutoBetMode = state.typeOfPlay === 'auto'

  useEffect(() => {
    return () => {
      isAutoBettingRef.current = false
    }
  }, [isMuted])

  useEffect(() => {
    stopAutoBetting()
  }, [selectedBalance?.currency])

  const { mutateAsync: betMutation } = useMutation(postBetRequest, {
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'An error occurred'
      toaster.create({
        title: 'Error placing bet',
        description: message,
        type: 'error',
        duration: 5000,
      })
    },
  })

  const selectNumber = async (number: number) => {
    if (state.betResponse.result.length > 0 || state.betResponse.result.includes(number)) {
      dispatch({ type: 'RESET_RESULT_NUMBERS' })
    }

    if (state.isAutoPicking) dispatch({ type: 'SET_IS_AUTO_PICKING', payload: false })

    dispatch({ type: 'SELECT_NUMBER', payload: number })

    !isMuted && play('autoPick')
  }

  const clearNumbers = () => {
    dispatch({ type: 'CLEAR_NUMBERS' })
  }

  const setTypeOfPlay = (value: GameMode) => {
    dispatch({ type: 'SET_TYPE_OF_PLAY', payload: value })
  }

  const setBetAmount = (value: number) => {
    const parsedValue = parseFloatValue(value,selectedBalance?.decimals)
    dispatch({ type: 'SET_BET_AMOUNT', payload: parsedValue })
    betAmountRef.current = parsedValue
  }

  const setRiskDropdownValue = (value: Risk) => {
    dispatch({ type: 'SET_RISK_DROPDOWN_VALUE', payload: value })
  }

  const setNumberOfBetsValue = (value: string) => {
    dispatch({ type: 'SET_NUMBER_OF_BETS_VALUE', payload: value })
  }

  const setOnWinValue = (value: number) => {
    dispatch({ type: 'SET_ON_WIN_VALUE', payload: value })
  }

  const setOnLossValue = (value: number) => {
    dispatch({ type: 'SET_ON_LOSS_VALUE', payload: value })
  }

  const setStopOnProfit = (value: string) => {
    dispatch({ type: 'SET_STOP_ON_PROFIT', payload: value })
  }

  const setStopOnLoss = (value: string) => {
    dispatch({ type: 'SET_STOP_ON_LOSS', payload: value })
  }

  const setIsAutoPicking = (value: boolean) => {
    dispatch({ type: 'SET_IS_AUTO_PICKING', payload: value })
  }

  const setIsAutoBetting = (value: boolean) => {
    dispatch({ type: 'SET_IS_AUTO_BETTING', payload: value })
  }

  const addResultNumber = (value: number) => {
    dispatch({ type: 'ADD_RESULT_NUMBER', payload: value })
  }

  const clearResultNumbers = () => {
    dispatch({ type: 'RESET_RESULT_NUMBERS' })
  }

  const setOnWinToggleValue = (value: PercentageInputToggleButtonType) => {
    dispatch({ type: 'SET_ON_WIN_TOGGLE_VALUE', payload: value })
  }

  const setOnLossToggleValue = (value: PercentageInputToggleButtonType) => {
    dispatch({ type: 'SET_ON_LOSS_TOGGLE_VALUE', payload: value })
  }

  const setShowMaxProfitModal = (value: boolean) => {
    dispatch({ type: 'SET_SHOW_MAX_PROFIT_MODAL', payload: value })
  }

  const adjustBetAmount = (result: 'win' | 'loss') => {
    const getNewBetAmount = (
      percentageValue: number,
      perentageToggleValue: PercentageInputToggleButtonType
    ) => {
      if (percentageValue === 0 && perentageToggleValue === 'reset') return initialBetAmount.current

      let newBetAmount = betAmountRef.current

      newBetAmount *= 1 + percentageValue / 100

      return newBetAmount
    }

    if (result === 'win') {
      setBetAmount(getNewBetAmount(state.onWinValue, state.onWinToggleValue))
    } else {
      setBetAmount(getNewBetAmount(state.onLossValue, state.onLossToggleValue))
    }
  }

  const handleOnBet = async () => {
    if (state.selectedNumbers.length === 0 || isBettingRef.current) return

    dispatch({ type: 'SET_IS_BETTING', payload: true })
    dispatch({ type: 'CLEAR_BET_RESPONSE' })
    dispatch({ type: 'SET_SHOW_MAX_PROFIT_MODAL', payload: false })

    isBettingRef.current = true

    const request: KenoBetRequest = {
      selectedNumbers: state.selectedNumbers,
      betAmount: betAmountRef.current,
      risk: state.riskDropdownValue,
      currency: selectedBalance?.currency as Currency,
      stopOnProfit: parseFloat(state.stopOnProfit),
      stopOnLoss: parseFloat(state.stopOnLoss),
      increaseBy: state.onWinValue,
      decreaseBy: state.onLossValue,
      isManualMode: state.typeOfPlay === 'manual',
      isTurboMode: isTurbo || false,
    }

    try {
      const response = await betMutation(request)

      await handleResultReveal(response)

      const profit = response.totalWinAmount ?? 0 - betAmountRef.current

      if (profit >= currencyMaxTable[selectedBalance?.currency as Currency].profit) {
        dispatch({ type: 'SET_SHOW_MAX_PROFIT_MODAL', payload: true })
      }

      totalProfitRef.current += profit
      await getWalletData()
      return response
    } finally {
      dispatch({ type: 'SET_IS_BETTING', payload: false })
      getWalletData()
      isBettingRef.current = false
    }
  }

  const handleAddResultNumber = (resultNumber: number) => {
    addResultNumber(resultNumber)

    if (!isMuted) {
      const isScoreNumber = state.selectedNumbers.includes(resultNumber)
      isScoreNumber ? play('gemReveal') : play('tileReveal')
    }
  }

  const handleResultReveal = async (response: KenoBetResponse) => {
    if (!isTurbo) {
      for (const resultNumber of response.result) {
        await asyncDelay(100)
        handleAddResultNumber(resultNumber)
      }
    } else {
      const selectedNumbers = new Set(state.selectedNumbers)

      if (!isMuted && response.result.some((r: number) => selectedNumbers.has(r))) {
        play('gemReveal')
      }
    }
    // We do this here because even if we are not in turbo mode, we need all of the response in the state
    dispatch({ type: 'SET_BET_RESPONSE', payload: response })
  }

  const handleBetOnClick = () => {
    if (!state.isAutoBetting && !isMuted) {
      playAudioSequence('onBetClick')
    }

    if (isAutoBetMode) {
      initialBetAmount.current = state.betAmount
      if (state.isAutoBetting) {
        stopAutoBetting()
      } else {
        handleAutoBet()
      }
    } else {
      handleOnBet()
    }
  }

  const betLoop = async (remainingBets: number) => {
    if (remainingBets === 0 || shouldStopAutoBetting()) {
      stopAutoBetting()
      return
    }

    const response = (await handleOnBet()) as KenoBetResponse

    adjustBetAmount(response.status)

    setNumberOfBetsValue((remainingBets - 1).toString())

    await asyncDelay(800) // Delay between bets

    await betLoop(remainingBets - 1)
  }

  const handleAutoBet = async () => {
    if (state.selectedNumbers.length === 0) return

    totalProfitRef.current = 0
    isAutoBettingRef.current = true
    setIsAutoBetting(true)

    const numberOfBets = parseInt(state.numberOfBetsValue)

    try {
      if (numberOfBets > 0) {
        await betLoop(numberOfBets)
      } else {
        // Infinite loop with a break condition based on stop criteria
        while (!shouldStopAutoBetting()) {
          const response = (await handleOnBet()) as KenoBetResponse

          adjustBetAmount(response.status)

          await asyncDelay(800) // Delay between bets
        }
        stopAutoBetting() // Ensure auto-betting stops after exiting the loop
      }
    } catch {
      stopAutoBetting()
    }
  }

  const shouldStopAutoBetting = () => {
    const stopOnProfit = parseFloat(state.stopOnProfit)
    const stopOnLoss = parseFloat(state.stopOnLoss)

    return (
      !isAutoBettingRef.current ||
      (stopOnProfit > 0 && totalProfitRef.current >= stopOnProfit) ||
      (stopOnLoss > 0 && totalProfitRef.current <= -stopOnLoss)
    )
  }

  const stopAutoBetting = () => {
    setIsAutoBetting(false)
    totalProfitRef.current = 0
    isAutoBettingRef.current = false
    betAmountRef.current = state.betAmount
  }

  const handleAutoPick = async () => {
    setIsAutoPicking(true)

    const selectedNumbers = new Set(state.selectedNumbers)

    const isSelectedNumbersFull = selectedNumbers.size === 10

    if (isSelectedNumbersFull) {
      selectedNumbers.clear()
      clearNumbers()
    }

    if (state.betResponse.result.length > 0) {
      clearResultNumbers()
    }

    const randomNumbers = generateUniqueRandomNumbers(selectedNumbers)

    const filteredRandomNumbers = isSelectedNumbersFull
      ? randomNumbers
      : randomNumbers.filter((n) => !state.selectedNumbers.includes(n))

    if (!isTurbo) {
      for (let i = 0; i < filteredRandomNumbers.length; i++) {
        dispatch({ type: 'SELECT_NUMBER', payload: filteredRandomNumbers[i] })

        if (!isMuted) {
          await playAudioSequence('autoPick')
        } else {
          await asyncDelay(100)
        }
      }
    } else {
      dispatch({ type: 'SET_SELECTED_NUMBERS', payload: randomNumbers })
    }

    setIsAutoPicking(false)
  }

  const doubleBetAmount = () => {
    if (state.isAutoPicking || state.isAutoBetting || state.isBetting) return

    setBetAmount(state.betAmount * 2)
  }

  const halveBetAmount = () => {
    if (state.isAutoPicking || state.isAutoBetting || state.isBetting) return

    setBetAmount(state.betAmount / 2)
  }

  const { betAmountErrors: originalBetAmountErrors } = useBetAmount(state.betAmount.toString())

  const betAmountErrors = {
    ...originalBetAmountErrors,
    maxBetExceeded:
      state.betAmount > currencyMaxTable[selectedBalance?.currency as Currency]?.bet
        ? 'Bet exceeds maximum bet amount'
        : undefined,
  }

  const isBetButtonDisabled =
    state.selectedNumbers.length === 0 ||
    state.isAutoPicking ||
    (state.isBetting && !state.isAutoBetting) ||
    !!betAmountErrors.betAmount ||
    !!betAmountErrors.maxBetExceeded

  const controlsDisabled = state.isAutoPicking || state.isBetting || state.isAutoBetting

  return {
    ...state,
    isBetButtonDisabled,
    controlsDisabled,
    selectNumber,
    clearNumbers,
    setTypeOfPlay,
    setBetAmount,
    setRiskDropdownValue,
    setNumberOfBetsValue,
    setOnWinValue,
    setOnLossValue,
    setStopOnProfit,
    setStopOnLoss,
    handleAutoPick,
    handleAutoBet,
    handleOnBet,
    handleBetOnClick,
    stopAutoBetting,
    clearResultNumbers,
    doubleBetAmount,
    halveBetAmount,
    betAmountErrors,
    setOnWinToggleValue,
    setOnLossToggleValue,
    showMaxProfitModal: state.showMaxProfitModal,
    setShowMaxProfitModal,
  }
}

export default useKenoState
