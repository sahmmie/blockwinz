/* eslint-disable @typescript-eslint/no-unused-expressions */
import { useEffect, useRef, useState } from 'react'
import {
  BOARD_SIZE,
  TOTAL_TILES,
} from '../constants'
import { useTictactoe } from './useTictactoe'
import { useSound } from './useSound'
import {
  BET_STATUS,
  IErrorMsg,
  Move,
  RiskLevel,
  TICTACTOE_TILE,
  TictactoeActiveGame,
  TicTacToeMove,
  TicTacToeStart,
  TictactoeState,
} from '../types'
import useWalletState from '@/hooks/useWalletState'
import { useSettingsStore } from '@/hooks/useSettings'
import { parseFloatValue } from '@/shared/utils/common'
import { useBetAmount } from '@/hooks/useBetAmount'
import { toaster } from '@/components/ui/toaster'
import { BetType } from '@/shared/types/core'
import useModal, { ModalProps } from '@/hooks/useModal'
import { GameMode } from '@blockwinz/shared'
import GameStatusModal from '../components/modals/GameStatusModal'

const createInitialCells = (): string[] => {
  return Array.from({ length: TOTAL_TILES })
}

export const useTictactoeState = () => {
  const { selectedBalance, balances } = useWalletState()
  const {
    settings: { isTurbo },
  } = useSettingsStore()

  const { state: serviceState, actions: serviceActions } = useTictactoe()

  const { betAmount } =
    serviceState.activeGame?.data || {}

  const { play } = useSound()

  const { openModal } = useModal();

  const { getWalletData } = useWalletState();


  const [state, setState] = useState<TictactoeState>({
    multiplier: RiskLevel.MEDIUM,
    betAmountErrors: {},
    maxProfitErrors: {},
    mode: GameMode.Manual,
    betAmount: betAmount || 0,
    profitOnWin: 0,
    animSpeed: isTurbo ? 50 : 500,
    activeAutoBet: false,
    currency: selectedBalance?.currency,
    hasError: false,
    errorMsg: { title: '', description: '' },
    activeGameId: '',
    isLoading: false,
    modalIsOpen: false,
    cells: createInitialCells(),
    betResultStatus: BET_STATUS.NOT_STARTED,
    userIs: TICTACTOE_TILE.O,
    aiIs: TICTACTOE_TILE.X,
    currentTurn: TICTACTOE_TILE.O,
    tokenHash: '',
    isTurboMode: false,
    isAnimating: false,
  })

  const updateState = (
    newState:
      | Partial<TictactoeState>
      | ((prevState: TictactoeState) => Partial<TictactoeState>)
  ) => {
    setState((prevState) => {
      const resolvedState = typeof newState === 'function' ? newState(prevState) : newState
      return { ...prevState, ...resolvedState }
    })
  }

  const betAmountRef = useRef(state.betAmount)
  const betAmountState = useBetAmount(state.betAmount.toString())
  const stateRef = useRef(state)

  useEffect(() => {
    stateRef.current = state
  }, [state])

  useEffect(() => {
    updateState({ profitOnWin: state.betAmount * parseFloatValue(state.multiplier) })
  }, [state.betAmount, state.multiplier])

  const getLatestState = () => stateRef.current

  const activeCurrencyInfo = balances.find(c => c.currency === getLatestState().currency) || selectedBalance

  useEffect(() => {
    if (state.hasError) {
      toaster.create({
        title: state.errorMsg?.title,
        description: state.errorMsg?.description,
        type: 'error',
      })
    }
    const timeout = setTimeout(() => {
      state.hasError && updateState({ hasError: false, errorMsg: { title: '', description: '' } })
    }, 3000)
    return () => clearTimeout(timeout)
  }, [state.hasError])

  useEffect(() => {
    fetchActiveGame()
  }, [])

  useEffect(() => {
    // Only update currency when there's no active game
    if (!state.activeGameId && state.betResultStatus !== BET_STATUS.IN_PROGRESS) {
      updateState({
        currency: selectedBalance?.currency
      })
    }
  }, [selectedBalance?.currency])

  const setBetType = (value: BetType) => updateState({ mode: value })

  const setMultiplier = (value: RiskLevel) => updateState({ multiplier: value })

  const setProfitOnWin = (value: number) => updateState({ profitOnWin: value })

  const setHasError = (value: boolean) => updateState({ hasError: value })

  const setErrorMsg = (value: IErrorMsg) => updateState({ errorMsg: value })

  const setIsAnimating = (value: boolean) => updateState({ isAnimating: value })

  const handleBetAmountChange = (value: number) => {
    const parsedValue = parseFloatValue(value, activeCurrencyInfo?.decimals)
    updateState({ betAmount: parsedValue })
    betAmountRef.current = parsedValue
  }

  const closeModal = () => updateState({ modalIsOpen: false })

  const handleToggleChange = (value: BetType) =>
    updateState({
      cells: createInitialCells(),
      mode: value,
      profitOnWin: 0,
    })

  const handleResetBoard = () =>
    updateState({
      cells: createInitialCells(),
    })


  const fetchActiveGame = async () => {
    updateState({ isLoading: true })
    try {
      const res = await serviceActions.refetchActiveGame()
      const activeGameData = res.data?.data
      if (
        activeGameData?._id &&
        activeGameData?.betResultStatus === BET_STATUS.IN_PROGRESS
      ) {
        initActiveGame(activeGameData)
      } else {
        initNewGame()
      }
    } catch (error) {
      updateState({ isLoading: false })
      console.error('Error fetching active game:', error)
    }
  }

  const handleOnBet = async () => {
    const latestState = getLatestState()
    if (latestState.isLoading || (latestState.activeGameId && latestState.betResultStatus === BET_STATUS.IN_PROGRESS)) return
    play('startBet')
    const reqBody: TicTacToeStart = {
      currency: state.currency,
      betAmount: latestState.betAmount,
      isTurboMode: isTurbo || false,
      multiplier: String(latestState.multiplier) as unknown as RiskLevel,
    }
    try {
      const result = (await serviceActions.startGame(reqBody))?.data
      if (result) {
        updateState({
          isLoading: false,
          betResultStatus: result?.betResultStatus,
          userIs: result?.userIs,
          aiIs: result?.aiIs,
          currentTurn: result?.currentTurn,
          betAmount: result?.betAmount,
          tokenHash: result?.tokenHash,
          isTurboMode: result?.isTurboMode,
          activeGameId: result?._id,
          multiplier: result?.multiplier.toString() as RiskLevel,
          activeAutoBet: false,
          profitOnWin: result.betAmount * parseFloatValue(result.multiplier),
          cells: result?.board?.flat() || createInitialCells(),
          currency: result?.currency,
        })
        await getWalletData()
      } else {
        throw new Error('Game could not be started')
      }
    } catch {
      updateState({
        isLoading: false, betResultStatus: BET_STATUS.NOT_STARTED, activeGameId: null, hasError: true,
        errorMsg: { title: 'Game could not be started', description: 'Please try again' }
      })
    }
  }

  const initNewGame = () =>
    updateState({
      activeGameId: undefined,
      betAmount: 0,
      profitOnWin: 0,
      cells: createInitialCells(),
      isLoading: false,
      betResultStatus: BET_STATUS.NOT_STARTED,
      userIs: TICTACTOE_TILE.O,
      aiIs: TICTACTOE_TILE.X,
      currentTurn: TICTACTOE_TILE.O,
      isTurboMode: false,
      activeAutoBet: false,
      multiplier: RiskLevel.MEDIUM
    })

  const initActiveGame = (activeGameData: TictactoeActiveGame) => {
    updateState({
      activeGameId: activeGameData._id,
      betAmount: activeGameData.betAmount,
      multiplier: activeGameData.multiplier,
      isLoading: false,
      profitOnWin: activeGameData.betAmount * parseFloatValue(activeGameData.multiplier),
      cells: activeGameData.board.flat(),
      betResultStatus: activeGameData.betResultStatus,
      userIs: activeGameData.userIs,
      aiIs: activeGameData.aiIs,
      currentTurn: activeGameData.currentTurn,
      tokenHash: activeGameData.tokenHash,
      isTurboMode: activeGameData.isTurboMode,
      currency: activeGameData.currency,
    })
  }

  const handleSelectCell = async (cellIndex: number) => {
    const { cells, userIs, currentTurn, aiIs } = getLatestState()
    if (currentTurn === aiIs || state.isAnimating) return
    cells[cellIndex] = userIs;
    play('tileClick')
    updateState({ cells })
    const reqBody: TicTacToeMove = {
      move: getRowAndColumnFromIndex(cellIndex)
    }
    const result = await serviceActions.makeMove(reqBody)
    updateState({ betResultStatus: result?.data.betResultStatus })
    if (result && result.data.move) {
      setIsAnimating(true)
      setTimeout(() => {
        displayAiMove(result.data.move)
        setIsAnimating(false)
      }, state.animSpeed);
    }
  }

  const displayAiMove = (move: Move) => {
    const moveIndex = getIndexFromRowAndColumn(move.row, move.column)
    const { cells, aiIs } = getLatestState()
    cells[moveIndex] = aiIs;
    play('tileClickAI')
    updateState({ cells })
  }

  const getIndexFromRowAndColumn = (row: number, column: number): number => {
    return row * BOARD_SIZE + column;
  };

  const getRowAndColumnFromIndex = (index: number): { row: number; column: number } => {
    const row = (Math.floor(index / BOARD_SIZE));
    const column = ((index % BOARD_SIZE));
    return { row, column };
  };

  const isActiveGame = (): boolean => !!state.activeGameId

  const hasEnded = (): boolean => !!state.activeGameId
    && state.betResultStatus !== BET_STATUS.IN_PROGRESS

  useEffect(() => {
    const props = {
      multiplier: state.multiplier,
      winAmount: state.betResultStatus === BET_STATUS.WIN ? state.betAmount * parseFloatValue(state.multiplier) : 0,
      betResultStatus: state.betResultStatus,
      currency: activeCurrencyInfo,
    }
    const modalConfig: ModalProps =
    {
      size: 'xs',
      hideCloseButton: true,
      hideHeader: true,
      width: '200px',
      backgroundColor: '#00DD25',
      autoCloseAfter: 0,
      top: { base: '0', md: '-8%' },
      left: { base: '0', md: 20 },
      closeOnInteractInside: true,
      backdrop: true,
    }

    if (state.betResultStatus === BET_STATUS.WIN) {
      play('betWin')
      openModal(GameStatusModal(props), 'Win!', modalConfig)
      updateState({activeGameId: null})
    }
    if (state.betResultStatus === BET_STATUS.LOSE) {
      openModal(GameStatusModal(props), 'Lost!', { ...modalConfig, backgroundColor: '#545463' })
      updateState({activeGameId: null})
    }
    if (state.betResultStatus === BET_STATUS.TIE) {
      openModal(GameStatusModal(props), 'Tie!', { ...modalConfig, backgroundColor: '#545463' })
      updateState({activeGameId: null})
    }
  }, [state.betResultStatus])

  useEffect(() => {
    if (hasEnded()) {
      getWalletData();
    }
  }, [hasEnded()])

  return {
    state: {
      ...state,
      betAmountErrors: betAmountState.betAmountErrors,
      isLoadingStart: serviceState.isLoadingStart,
      isActiveGame,
      hasEnded
    },
    actions: {
      updateState,
      setBetType,
      setProfitOnWin,
      setHasError,
      setErrorMsg,
      handleBetAmountChange,
      closeModal,
      handleToggleChange,
      handleResetBoard,
      fetchActiveGame,
      handleOnBet,
      handleSelectCell,
      setMultiplier,
    },
  }
}
