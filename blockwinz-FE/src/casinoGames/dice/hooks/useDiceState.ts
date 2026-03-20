/* eslint-disable @typescript-eslint/no-unused-expressions */
import { useBetAmount, useProfitAmount } from "@/hooks/useBetAmount"
import { useGameState } from "@/hooks/useGameState"
import { useMultiplierState } from "@/hooks/useMultiplierState"
import { GameState, GameStateWithMultiplier, SpeedTypes } from "@/shared/types/core"
import { checkIsBetDisabled, getNewSliderValue, getProfitOnWin, parseNumberString } from "@/shared/utils/common"
import { useEffect, useMemo } from "react"
import { useSound } from "./useSound"
import { useSettingsStore } from "@/hooks/useSettings"
import { DiceBetRequest, DiceBetResponse, DiceGameState } from "../types"
import { GameTypeEnum } from "@blockwinz/shared"
import useWalletState from "@/hooks/useWalletState"

export const useDiceState = () => {
  const { settings } = useSettingsStore()
  const { getWalletData } = useWalletState()

  const multiplierState = useMultiplierState(GameTypeEnum.DiceGame)

  const { play, playAudioSequence } = useSound()

  const { state, actions } = useGameState<DiceGameState, DiceBetRequest, DiceBetResponse>({
    initialState: {
      animNormalSpeed: 300,
      animTurboSpeed: 150,
      delayBeforeNextAutoBet: 0,
      zeroBetDelay: 250,
      result: -1,
      isSuccess: false,
    },
    betEndpoint: '/dice',
    onBetRequest: () => {
      playAudioSequence(settings.isMuted || false)

      return {
        direction: multiplierState.direction,
        rollOverBet: parseNumberString(multiplierState.rollOverBet.toFixed(2)),
      }
    },
    onBetResult: (_: GameState, res: DiceBetResponse) => {
      actions.updateState({ result: res.result })
    },
    onAnimFinish: (currState: GameState, res: DiceBetResponse) => {
      getWalletData()
      currState
      res
    },
  })

  const betAmountState = useBetAmount(state.betAmount)
  const profitAmountState = useProfitAmount(state.profitOnWin)

  const updateAnimSpeedType = () => {
    actions.updateState({ speedType: settings.isTurbo ? SpeedTypes.TURBO : SpeedTypes.NORMAL })
  }

  const updateProfitOnWin = () =>
    actions.handleProfitOnWinChange(getProfitOnWin(state.betAmount, multiplierState.multiplier))

  const processGameResult = () => {
    if (state.result === -1) return
    const won =
      multiplierState.direction === 'over'
        ? state.result > multiplierState.rollOverBet
        : state.result < multiplierState.rollOverBet
    actions.updateState({ isSuccess: won })

    actions.addNewTagResult(state.result, won)

    if (won) {
      play('diceWin', settings.isMuted)
    }
  }

  useEffect(updateAnimSpeedType, [settings.isTurbo])
  useEffect(updateProfitOnWin, [
    state.betAmount,
    state.rollOverBet,
    multiplierState.multiplier,
    state.chance,
  ])
  useEffect(processGameResult, [state.result])

  const handleSliderChange = (val: number) => multiplierState.setRollOverBet(getNewSliderValue(val))
  const isBetDisabled = checkIsBetDisabled(
    state as GameStateWithMultiplier,
    {
      ...multiplierState.errors,
      ...betAmountState.betAmountErrors,
      ...profitAmountState.profitAmountErrors,
    },
    !!(Number(state.betAmount) === 0)
  )

  const value = useMemo(() => {
    return {
      ...state,
      ...actions,
      ...multiplierState,
      ...betAmountState,
      ...profitAmountState,
      isRollOver: multiplierState.direction === 'over',
      handleSliderChange,
      startBetting: () => {
        if (isBetDisabled) return
        actions.startBetting()
      },
      isBetDisabled,
    }
  }, [state, actions, multiplierState])

  return value
}
