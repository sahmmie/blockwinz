
import { useBetAmount, useProfitAmount } from '@/hooks/useBetAmount'
import { useGameState } from '@/hooks/useGameState'
import { useMultiplierState } from '@/hooks/useMultiplierState'
import { useSettingsStore } from '@/hooks/useSettings'
import { BetStatus, GameStateWithMultiplier, SpeedTypes } from '@/shared/types/core'
import { checkIsBetDisabled } from '@/shared/utils/common'
import { useEffect } from 'react'
import { LimboBetRequest, LimboBetResponse, LimboGameState } from '../types/limboTypes'
import { useSound } from './useSound'
import { GameTypeEnum } from '@/shared/enums/gameType.enum'
import useWalletState from '@/hooks/useWalletState'
import { DEFAULT_ROUNDING_DECIMALS } from '@/shared/constants/app.constant'
export type GameState = LimboGameState & LimboBetRequest & LimboBetResponse

const useLimboState = () => {
  const { settings } = useSettingsStore()
  const { getWalletData, selectedBalance } = useWalletState()
  const ROUNDING_DECIMALS = selectedBalance.decimals || DEFAULT_ROUNDING_DECIMALS
  const multiplierState = useMultiplierState(GameTypeEnum.LimboGame)
  const { multiplier, chance } = multiplierState
  const { state, actions } = useGameState<LimboGameState, LimboBetRequest, LimboBetResponse>({
    initialState: {
      animNormalSpeed: 300,
      animTurboSpeed: 150,
      delayBeforeNextAutoBet: 250,
      delayBeforeNextBet: 0,
      resultMultiplier: undefined,
      isBetWon: false,
      zeroBetDelay: 200,
      waitForAnimation: true,
    },
    betEndpoint: '/limbo',
    onBetRequest: (): Partial<LimboBetRequest> => {
      play('click', settings.isMuted)
      return {
        multiplier: parseFloat(multiplier),
      }
    },
    onBetResult: (currState, response: LimboBetResponse) => {
      if (currState.isAutoBetting) {
        // actions.setIsAnimating(false)
      }
      play('calc', settings.isMuted)
      setResultStatus(response.betResultStatus === BetStatus.WIN)
      setResultMultiplier(response.result.toString())
    },
    onAnimFinish: (_, response: LimboBetResponse) => {
      getWalletData()
      if (response.betResultStatus === BetStatus.WIN) {
        play('score', settings.isMuted)
      }
    },
  })

  const { play } = useSound()

  const updateAnimSpeedType = () => {
    actions.updateState({ speedType: settings.isTurbo ? SpeedTypes.TURBO : SpeedTypes.NORMAL })
  }

  useEffect(updateAnimSpeedType, [settings.isTurbo])

  const setResultMultiplier = (value: string) => {
    actions.updateState({ resultMultiplier: value })
  }

  const setResultStatus = (value: boolean) => {
    actions.updateState({ isBetWon: value })
  }

  const setProfitOnWin = (amount: number, multiplier: number) => {
    const expectedProfit = amount * multiplier - amount
    actions.updateState({ profitOnWin: expectedProfit.toString() })
  }

  useEffect(() => {
    const expectedProfit = parseFloat(state.betAmount) * parseFloat(multiplier)
    actions.handleProfitOnWinChange(expectedProfit.toFixed(ROUNDING_DECIMALS))
  }, [chance, multiplier, state.betAmount])

  useEffect(() => {
    if (state.isAutoBetting) {
      actions.startAutoBet()
    } else {
      actions.stopAutoBet()
    }
  }, [state.isAutoBetting])

  useEffect(() => {
    setProfitOnWin(parseFloat(state.betAmount), parseFloat(multiplier))
  }, [chance, multiplier, state.isAutoBetting, state.betAmount])

  const betAmountState = useBetAmount(state.betAmount)
  const profitAmountState = useProfitAmount(state.profitOnWin)

  const isBetDisabled = checkIsBetDisabled(
    state as unknown as GameStateWithMultiplier,
    {
      ...multiplierState.errors,
      ...betAmountState.betAmountErrors,
      ...profitAmountState.profitAmountErrors,
    },
    true
  )

  return {
    ...state,
    ...actions,
    ...multiplierState,
    ...betAmountState,
    ...profitAmountState,
    startBetting: () => {
      if (isBetDisabled) return
      actions.startBetting()
    },
    setResultStatus,
    isBetDisabled,
  }
}

export default useLimboState
