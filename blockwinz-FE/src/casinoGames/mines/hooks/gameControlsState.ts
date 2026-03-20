/* eslint-disable @typescript-eslint/no-unused-expressions */
import { useBetAmount } from '@/hooks/useBetAmount'
import { parseFloatValue } from '@/shared/utils/common'
import { debounce } from 'lodash'
import { useCallback, useEffect, useRef, useState } from 'react'
import { TOTAL_TILES, ALL_TILES_LOADED, ALL_TILES_LOADING, BET_STATUS } from '../constants'
import { ITile, IGameControlsState, IErrorMsg, IMinesStartResponse, IMinesCashoutResponse, IMinesStart } from '../types'
import { useMines } from './useMines'
import { useSound } from './useSound'
import { useSettingsStore } from '@/hooks/useSettings'
import { toaster } from '@/components/ui/toaster'
import useWalletState from '@/hooks/useWalletState'
import { useMaxProfit } from './useMaxProfit'
import { GameMode } from '@/shared/enums/gameMode.enum'
import { DEFAULT_CURRENCY, DEFAULT_ROUNDING_DECIMALS } from '@/shared/constants/app.constant'

const createInitialTiles = (selectedIndexes: number[] = []): ITile[] => {
  return Array.from({ length: TOTAL_TILES }, (_, index) => ({
    isRevealed: false,
    isSelected: selectedIndexes.includes(index),
    content: '',
  }))
}

const isLoadingTile = ALL_TILES_LOADED

export const useGameControlsState = () => {
  const { selectedBalance, balances } = useWalletState()

  const ROUNDING_DECIMALS = balances.find(c => c.currency === selectedBalance?.currency)?.decimals || DEFAULT_ROUNDING_DECIMALS;

  const {
    settings: { isTurbo },
  } = useSettingsStore()

  const { state: serviceState, actions: serviceActions } = useMines()

  const { betAmount, minesCount, multiplier, nextWinMultiplier } =
    serviceState.activeGame?.data || {}

  const { play } = useSound()

  const [state, setState] = useState<IGameControlsState>({
    betAmountErrors: {},
    isLoadingAutoBet: false,
    isLoadingCashout: false,
    isLoadingReveal: false,
    maxProfitErrors: {},
    betType: GameMode.Manual,
    betAmount: betAmount || 0,
    numberOfBets: 1,
    totalProfit: 0.0,
    nextTotalProfit: 0.0,
    onWinValue: 0,
    onLossValue: 0,
    onWinReset: true,
    onLossReset: true,
    stopOnProfit: 0,
    stopOnLoss: 0,
    minesCount: minesCount || 5,
    gemsCount: TOTAL_TILES - (minesCount || 5),
    animSpeed: isTurbo ? 50 : 500,
    stopAutoBet: true,
    activeBet: false,
    activeAutoBet: false,
    activeBoard: true,
    showPopUp: false,
    currency: selectedBalance?.currency || DEFAULT_CURRENCY,
    hasError: false,
    errorMsg: { title: '', description: '' },
    selectedTiles: [],
    activeGameId: '',
    isLoading: false,
    isLoadingTile: isLoadingTile || [],
    multiplier: multiplier || 0,
    nextWinMultiplier: nextWinMultiplier || 1,
    tiles: createInitialTiles() || [],
    manualSelectedTiles: [],
    modalIsOpen: false,
  })

  const updateState = (
    newState:
      | Partial<IGameControlsState>
      | ((prevState: IGameControlsState) => Partial<IGameControlsState>)
  ) => {
    setState((prevState) => {
      const resolvedState = typeof newState === 'function' ? newState(prevState) : newState
      return { ...prevState, ...resolvedState }
    })
  }

  const betAmountRef = useRef(state.betAmount)
  const betAmountState = useBetAmount(state.betAmount.toString())
  const stateRef = useRef(state)
  const { getWalletData } = useWalletState();

  useEffect(() => {
    stateRef.current = state
  }, [state])

  const getLatestState = () => stateRef.current


  // Add this useEffect after your existing useEffects
  useEffect(() => {
    // Only update currency when there's no active game
    if (!state.activeGameId && !state.activeBet) {
      updateState({
        currency: selectedBalance?.currency || DEFAULT_CURRENCY
      })
    }
  }, [selectedBalance?.currency])

  useEffect(() => {
    if (state.hasError) {
      toaster.create({
        title: state.errorMsg?.title,
        description: state.errorMsg?.description,
        type: 'error',
      })
    }
    setTimeout(() => {
      state.hasError && updateState({ hasError: false, errorMsg: { title: '', description: '' } })
    }, 3000)
  }, [state.hasError])

  useEffect(() => {
    fetchActiveGame()
  }, [])

  useEffect(() => {
    if (state.betType === GameMode.Auto) {
      updateState({ tiles: createInitialTiles(), selectedTiles: [] })
    }
  }, [state.minesCount])

  const openedMines =
    state.betType === GameMode.Manual
      ? state.manualSelectedTiles?.length
      : state.selectedTiles.length
  const { maxProfitErrors } = useMaxProfit(state.betAmount, state.minesCount, openedMines)

  useEffect(() => {
    checkAndForceCashout()
  }, [maxProfitErrors])

  const checkAndForceCashout = () => {
    if (maxProfitErrors?.betAmount && state.activeGameId) {
      updateState({ modalIsOpen: true })
    }
  }

  const setBetType = (value: GameMode) => updateState({ betType: value })

  const setTotalProfit = (value: number) => updateState({ totalProfit: value })

  const setOnWinValue = (value: number) => updateState({ onWinValue: value })

  const setOnLossValue = (value: number) => updateState({ onLossValue: value })

  const setStopOnProfit = (value: number) => updateState({ stopOnProfit: parseFloatValue(value, selectedBalance?.decimals) })

  const setStopOnLoss = (value: number) => updateState({ stopOnLoss: parseFloatValue(value, selectedBalance?.decimals) })

  const setMinesCount = (value: number) => updateState({ minesCount: value })

  const setGemsCount = (value: number) => updateState({ gemsCount: value })

  const setShowPopUp = (value: boolean) => updateState({ showPopUp: value })

  const setActiveBet = (value: boolean) => updateState({ activeBet: value })

  const setHasError = (value: boolean) => updateState({ hasError: value })

  const setErrorMsg = (value: IErrorMsg) => updateState({ errorMsg: value })

  const resetOnWin = (value: boolean) => updateState({ onWinReset: value, onWinValue: 0 })

  const resetOnLoss = (value: boolean) => updateState({ onLossReset: value, onLossValue: 0 })

  const setBetAmount = (value: number) => {
    const parsedValue = parseFloatValue(value, selectedBalance?.decimals)
    updateState({ betAmount: parsedValue })
    betAmountRef.current = parsedValue
  }

  const setNumberOfBets = (value: number) => updateState({ numberOfBets: isNaN(value) ? 0 : value })

  const setIsLoadingTile = (index: number, isLoading: boolean) =>
    updateState((prevState) => {
      const newIsLoadingTile = [...prevState.isLoadingTile]
      newIsLoadingTile[index] = isLoading
      return { isLoadingTile: newIsLoadingTile }
    })

  const closeModal = () => updateState({ modalIsOpen: false })

  const handleToggleChange = (value: GameMode) =>
    updateState({
      tiles: createInitialTiles(),
      betType: value,
      activeBet: false,
      activeBoard: value === GameMode.Auto,
      totalProfit: 0,
      nextTotalProfit: 0,
      multiplier: 0,
      nextWinMultiplier: 1,
      onLossValue: 0,
      onWinValue: 0,
      showPopUp: false,
      selectedTiles: [],
      manualSelectedTiles: [],
    })

  const handleResetBoard = () =>
    updateState({
      tiles: createInitialTiles(getLatestState().selectedTiles),
      totalProfit: 0,
      nextTotalProfit: 0,
      multiplier: 0,
      nextWinMultiplier: 1,
      showPopUp: false,
      stopAutoBet: false,
      currency: selectedBalance?.currency || DEFAULT_CURRENCY,
    })

  const setProfits = (result: IMinesStartResponse) =>
    updateState({
      totalProfit:
        Number.isFinite(result?.multiplier) && Number.isFinite(result?.betAmount)
          ? result.multiplier * result.betAmount
          : 0,
      multiplier: Number.isFinite(result?.multiplier) ? result.multiplier : 0,
      nextTotalProfit:
        Number.isFinite(result?.nextWinMultiplier) && Number.isFinite(result?.betAmount)
          ? result.nextWinMultiplier * result.betAmount
          : 0,
      nextWinMultiplier: Number.isFinite(result?.nextWinMultiplier) ? result.nextWinMultiplier : 1,
    })

  const fetchActiveGame = async () => {
    updateState({ isLoadingTile: ALL_TILES_LOADING })
    try {
      const res = await serviceActions.refetchActiveGame()
      const activeGameData = res.data?.data
      const latestState = getLatestState()
      if (
        activeGameData?.id &&
        activeGameData?.betResultStatus === BET_STATUS.OPEN &&
        latestState.betType === GameMode.Manual
      ) {
        initActiveGame(activeGameData)
      } else {
        initNewGame()
      }
    } catch (error) {
      console.error('Error fetching active game:', error)
    }
  }

  const handleStartMines = async () => {
    const latestState = getLatestState()
    if (latestState.activeBet || latestState.isLoading || latestState.activeGameId !== '') return
    play('startBet')
    updateState({
      showPopUp: false,
      tiles: createInitialTiles(),
      isLoading: true,
      gemsCount: TOTAL_TILES - latestState.minesCount,
    })
    const reqBody = {
      minesCount: latestState.minesCount,
      currency: selectedBalance?.currency,
      betAmount: latestState.betAmount,
      stopOnProfit: latestState.stopOnProfit,
      stopOnLoss: latestState.stopOnLoss,
      increaseBy: latestState.onWinValue,
      decreaseBy: latestState.onLossValue,
      isManualMode: latestState.betType === GameMode.Manual,
      isTurboMode: isTurbo,
    } as IMinesStart
    try {
      const result = await serviceActions.startGame(reqBody)
      if (!result) return
      if (!serviceState.isLoadingStart) updateState({ activeGameId: result?.data?.id })
      setProfits(result?.data)
      updateState({
        activeBet: true,
        activeBoard: true,
        showPopUp: false,
        isLoading: false,
      })
      await getWalletData()
    } catch {
      updateState({ activeBet: false, isLoading: false })
    }
  }

  const initNewGame = () =>
    updateState({
      activeBet: false,
      multiplier: 0,
      totalProfit: 0,
      nextTotalProfit: 0,
      minesCount: 5,
      activeGameId: '',
      betAmount: 0,
      onWinValue: 0,
      onLossValue: 0,
      stopOnLoss: 0,
      stopOnProfit: 0,
      selectedTiles: [],
      showPopUp: false,
      isLoadingTile: ALL_TILES_LOADED,
      tiles: createInitialTiles(),
    })

  const initActiveGame = (activeGameData: IMinesCashoutResponse) => {
    setProfits(activeGameData)
    updateState({
      activeBet: true,
      activeBoard: true,
      minesCount: activeGameData.minesCount,
      activeGameId: activeGameData.id,
      betAmount: activeGameData.betAmount,
      isLoading: false,
      isLoadingTile: ALL_TILES_LOADED,
      totalProfit: Number(activeGameData.betAmount) * Number(activeGameData.multiplier),
      nextTotalProfit: activeGameData.betAmount * activeGameData.nextWinMultiplier,
      nextWinMultiplier: activeGameData.nextWinMultiplier,
      currency: activeGameData.currency || selectedBalance?.currency || DEFAULT_CURRENCY,
      selectedTiles: activeGameData.selected,
    })
    setActiveGameBoard(activeGameData.minesResult, activeGameData.selected)
  }

  const completeMinesGame = (mineIndexes: number[], selectedIndexes: number[]) => {
    const latestState = getLatestState()
    const newTiles = latestState.tiles.map((tile, index) => {
      const isMine = mineIndexes.includes(index)
      const isSelected = selectedIndexes.includes(index)
      const newContent = isMine ? 'bomb' : 'diamond'

      return {
        ...tile,
        content: newContent,
        isSelected: isSelected || tile.isSelected,
        isRevealed: true,
      }
    })
    updateState({
      tiles: newTiles,
      isLoading: false,
      manualSelectedTiles: [],
      modalIsOpen: false,
    })
  }

  const cashoutOnReveal = (
    mineIndexes: number[],
    selectedIndexes: number[],
    multiplier?: number,
    totalProfit?: number
  ) => {
    const latestState = getLatestState()

    if (latestState.betType !== GameMode.Manual) return
    const newTiles = latestState.tiles.map((tile, index) => {
      const isMine = mineIndexes.includes(index)
      const isSelected = selectedIndexes.includes(index)
      const newContent = isMine ? 'bomb' : 'diamond'

      return {
        ...tile,
        content: newContent,
        isSelected: isSelected || tile.isSelected,
        isRevealed: true,
      }
    })
    updateState({
      tiles: newTiles,
      isLoading: false,
      activeBet: false,
      showPopUp: true,
      activeGameId: '',
      multiplier,
      totalProfit,
    })
  }
  const handleRandomPick = async () => {
    const latestState = getLatestState()
    const isLoading = Object.values(latestState.isLoadingTile).some((value) => value)
    if (!latestState.activeBet || isLoading) {
      return false
    }

    const availableIndexes =
      latestState?.tiles
        ?.map((tile: ITile, index: number) => ({ tile, index }))
        .filter(({ tile }: { tile: ITile }) => !tile.isRevealed && !tile.isSelected)
        .map(({ index }: { index: number }) => index) ?? []

    if (availableIndexes.length === 0) {
      return false
    }

    const randIndex = availableIndexes[Math.floor(Math.random() * availableIndexes.length)]

    try {
      play('tileClick')
      updateState({ isLoading: true })
      setIsLoadingTile(randIndex, true)
      await handleRevealTile({ tileIndex: randIndex })
      setIsLoadingTile(randIndex, false)
    } catch {
      updateState({ isLoading: false })
    } finally {
      updateState({ isLoading: false })
    }
  }

  const shouldSkipReveal = (tileIndex: number): boolean => {
    const latestState = getLatestState()
    return (
      !latestState.activeBet ||
      latestState.isLoading ||
      !latestState.activeGameId ||
      serviceState.isLoadingReveal ||
      serviceState.isLoadingCashout ||
      latestState.tiles[tileIndex].isRevealed ||
      latestState.tiles[tileIndex].isSelected
    )
  }
  const handleRevealTile = async ({ tileIndex }: { tileIndex: number }) => {
    const latestState = getLatestState()
    if (shouldSkipReveal(tileIndex)) return
    updateState({ manualSelectedTiles: [...latestState.manualSelectedTiles, tileIndex] })
    const reqBody = {
      gameId: latestState.activeGameId,
      position: tileIndex,
    }
    updateState({ isLoading: true })
    try {
      const result = await serviceActions.revealTile(reqBody)
      if (!result) {
        handleResetBoard()
        await fetchActiveGame()
        return
      }
      if (result?.data?.betResultStatus === BET_STATUS.FINISHED) {
        play('bombReveal')
        updateState({
          activeGameId: '',
          activeBet: false,
          multiplier: result?.data?.multiplier,
          nextWinMultiplier: result?.data?.nextWinMultiplier,
          totalProfit: result?.data?.betAmount * result?.data?.multiplier,
          nextTotalProfit: result?.data?.betAmount * result?.data?.nextWinMultiplier,
        })
        completeMinesGame(result?.data?.minesResult, result?.data?.selected)
      } else if (result?.data?.betResultStatus === BET_STATUS.CASHOUT) {
        cashoutOnReveal(
          result?.data?.minesResult,
          result?.data?.selected,
          result?.data?.multiplier,
          result?.data?.betAmount * result?.data?.multiplier
        )
        await getWalletData()
      } else {
        updateState({
          multiplier: result?.data?.multiplier,
          nextWinMultiplier: result?.data?.nextWinMultiplier,
          totalProfit: result?.data?.betAmount * result?.data?.multiplier,
          nextTotalProfit: result?.data?.betAmount * result?.data?.nextWinMultiplier,
        })
        await updateSingleTile({
          tileIndex,
          isMine: false,
          isSelected: true,
        })
        removeGem()
      }
    } catch {
      updateState({ isLoading: false })
    } finally {
      updateState({ isLoading: false })
      checkAndForceCashout()
    }
  }

  const handleSelectTile = async ({ tileIndex }: { tileIndex: number }) => {
    const latestState = getLatestState()
    const newTiles = [...latestState.tiles]

    newTiles[tileIndex] = {
      ...newTiles[tileIndex],
      isSelected: !newTiles[tileIndex].isSelected,
    }

    let newSelectedTiles: number[] = [...latestState.selectedTiles]
    if (newTiles[tileIndex].isSelected) {
      if (latestState.selectedTiles.length >= TOTAL_TILES - latestState.minesCount) return
      newSelectedTiles.push(tileIndex)
      updateState({ selectedTiles: newSelectedTiles })
    } else {
      newSelectedTiles = newSelectedTiles.filter((index) => index !== tileIndex)
      updateState({ selectedTiles: newSelectedTiles })
    }
    updateState({ tiles: newTiles })
  }
  const updateSingleTile = async ({
    tileIndex,
    isMine,
    isSelected,
  }: {
    tileIndex: number
    isMine: boolean
    isSelected: boolean
  }) => {
    const newContent = isMine ? 'bomb' : 'diamond'

    updateState((prevState) => {
      const newTiles = [...prevState.tiles]
      newTiles[tileIndex] = {
        ...newTiles[tileIndex],
        content: newContent,
        isSelected: isSelected || newTiles[tileIndex].isSelected,
        isRevealed: true,
      }
      return { ...prevState, tiles: newTiles }
    })

    play(newContent === 'bomb' ? 'bombReveal' : 'gemReveal')
  }
  const handleCashout = async () => {
    const latestState = getLatestState()
    if (
      (!latestState.activeBet && !maxProfitErrors?.betAmount) ||
      latestState.isLoading ||
      latestState.activeGameId === ''
    )
      return
    try {
      updateState({ isLoading: true })
      const reqBody = { gameId: state.activeGameId }
      const result = await serviceActions.cashoutMines(reqBody)
      if (!result) {
        handleResetBoard()
        return
      }
      const { minesResult, selected } = result.data
      play('cashout')
      completeMinesGame(minesResult, selected)
      updateState({
        activeBet: false,
        showPopUp: true,
        activeGameId: '',
      })
      await getWalletData()
    } catch (error) {
      updateState({ isLoading: false })
      console.error('Error during cashout:', error)
    } finally {
      updateState({ isLoading: false })
    }
  }
  const setActiveGameBoard = (mineIndexes: number[], selectedIndexes: number[]) => {
    const defaultTiles = createInitialTiles()
    const newTiles = defaultTiles.map((tile, index) => {
      const isMine = mineIndexes.includes(index)
      const isSelected = selectedIndexes.includes(index)
      const newContent = isMine ? 'bomb' : 'diamond'

      return {
        ...tile,
        content: newContent,
        isSelected: isSelected || tile.isSelected,
        isRevealed: isSelected,
      }
    })
    updateState({ tiles: newTiles })
  }
  const onActiveGameSucess = (activeGameData: IMinesCashoutResponse) => {
    try {
      if (activeGameData?.id && activeGameData?.betResultStatus === BET_STATUS.OPEN) {
        updateState({
          activeBet: true,
          activeBoard: true,
          multiplier: activeGameData.multiplier,
          nextWinMultiplier: activeGameData.nextWinMultiplier,
          minesCount: activeGameData.minesCount,
          activeGameId: activeGameData.id,
          betAmount: activeGameData.betAmount,
          currency: activeGameData.currency || selectedBalance?.currency || DEFAULT_CURRENCY,
        })
        setActiveGameBoard(activeGameData.minesResult, activeGameData.selected)
      }
    } catch (error) {
      console.error('Error refetching active game:', error)
    }
  }

  const placeBetOrCashout = useCallback(
    debounce(async () => {
      const currentState = stateRef.current

      const noTileSelected = currentState?.tiles.every((tile: ITile) => !tile.isSelected)
      if (currentState.betType === GameMode.Auto) {
        //  Do nothing yet
      } else if (currentState.activeBet && !noTileSelected && !serviceState.isLoadingReveal) {
        await handleCashout()
      } else {
        await handleStartMines()
      }
    }, 200),
    [state, serviceState.isLoadingReveal]
  )

  const debouncedRandomSelect = debounce(async () => {
    await handleRandomPick()
  }, 100)

  const halveBetAmount = () => {
    const latestState = getLatestState()
    if (latestState.activeBet) return
    const newBetAmount = parseFloat((latestState.betAmount / 2).toFixed(ROUNDING_DECIMALS))
    updateState({ betAmount: newBetAmount })
  }

  const doubleBetAmount = () => {
    const latestState = getLatestState()
    if (!latestState.activeBet) {
      const newBetAmount =
        latestState.betAmount === 0.0 ? 0.01 : parseFloat((latestState.betAmount * 2).toFixed(ROUNDING_DECIMALS))
      updateState({ betAmount: newBetAmount })
    }
  }

  const removeMine = () => {
    updateState((prevState) => {
      if (prevState.minesCount > 1) {
        return { minesCount: prevState.minesCount - 1 }
      }
      return prevState
    })
  }

  const removeGem = () => {
    updateState((prevState) => {
      return { gemsCount: prevState.gemsCount - 1 }
    })
  }

  const addMine = () => {
    updateState((prevState) => {
      if (prevState.minesCount < 24) {
        return { minesCount: prevState.minesCount + 1 }
      }
      return prevState
    })
  }

  return {
    state: {
      ...state,
      betAmountErrors: betAmountState.betAmountErrors,
      maxProfitErrors,
      isLoadingCashout: serviceState.isLoadingCashout,
      isLoadingReveal: serviceState.isLoadingReveal,
      isLoadingStart: serviceState.isLoadingStart,
    },
    actions: {
      updateState,
      setBetType,
      setTotalProfit,
      setOnWinValue,
      setOnLossValue,
      setStopOnProfit,
      setStopOnLoss,
      setMinesCount,
      setGemsCount,
      setShowPopUp,
      setActiveBet,
      setHasError,
      setErrorMsg,
      resetOnWin,
      resetOnLoss,
      setBetAmount,
      setNumberOfBets,
      setIsLoadingTile,
      closeModal,
      handleToggleChange,
      handleResetBoard,
      setProfits,
      fetchActiveGame,
      handleStartMines,
      handleRandomPick,
      handleRevealTile,
      handleCashout,
      handleSelectTile,
      updateSingleTile,
      onActiveGameSucess,
      placeBetOrCashout,
      debouncedRandomSelect,
      halveBetAmount,
      doubleBetAmount,
      removeMine,
      removeGem,
      addMine,
    },
  }
}
