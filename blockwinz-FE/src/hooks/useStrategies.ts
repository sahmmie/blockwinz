import { BettingStrategies } from '@/shared/types/core'
import { useState } from 'react'

const lossThreshold = 3
const winThreshold = 3

export interface StrategyState {
  initialBetAmount: number
  strategy: BettingStrategies
  lossCount: number
  winCount: number
}

export const useStrategies = () => {
  const [state, setState] = useState<StrategyState>({
    winCount: 0,
    lossCount: 0,
    initialBetAmount: 0,
    strategy: BettingStrategies.MARTINGALE,
  })

  const updateState = (newState: Partial<StrategyState>) => {
    setState((prevState) => ({ ...prevState, ...newState }))
  }

  const setStrategy = (strategy: BettingStrategies) => {
    updateState({ strategy })
  }

  const setInitialBetAmount = (initialBetAmount: number) => {
    updateState({ initialBetAmount })
  }

  const martingale = (currentBetAmount: number, previousResult: string) => {
    if (previousResult === 'win') {
      // Reset bet amount if win
      return state.initialBetAmount
    } else {
      // Double the bet amount if loss
      return currentBetAmount * 2
    }
  }

  const delayedMartingale = (currentBetAmount: number, previousResult: string) => {
    if (previousResult === 'win') {
      // Reset consecutive losses if win
      updateState({ lossCount: 0 })
      return state.initialBetAmount
    } else {
      if (state.lossCount < lossThreshold) {
        // Increase consecutive losses if loss
        updateState({ lossCount: state.lossCount + 1 })
        return currentBetAmount
      } else {
        // Reset consecutive losses if loss threshold is reached
        updateState({ lossCount: 0 })
        // Double the bet amount if loss threshold is reached
        return currentBetAmount * 2
      }
    }
  }

  const paroli = (currentBetAmount: number, previousResult: string) => {
    if (previousResult === 'win') {
      if (state.winCount < winThreshold) {
        // Increase consecutive wins if win and return double the bet amount for the next bet if win threshold is not reached
        updateState({ winCount: state.winCount + 1 })
        return currentBetAmount * 2
      } else {
        // Reset consecutive wins if win threshold is reached and return initial bet amount
        updateState({ winCount: 0 })
        return state.initialBetAmount
      }
    } else {
      // Reset consecutive wins if loss and return initial bet amount
      updateState({ winCount: 0 })
      return state.initialBetAmount
    }
  }

  const dAlembert = (currentBetAmount: number, previousResult: string) => {
    if (previousResult === 'win') {
      if (currentBetAmount > state.initialBetAmount) {
        // Decrease the bet amount by initial bet amount if win
        return currentBetAmount - state.initialBetAmount
      }
      // Return initial bet amount if current bet amount is equal to initial bet amount
      return state.initialBetAmount
    } else {
      // Increase the bet amount by initial bet amount if loss
      return currentBetAmount + state.initialBetAmount
    }
  }

  const getNextBetAmount = (currentBetAmount: number, previousResult: string) => {
    if (state.strategy === BettingStrategies.MARTINGALE) {
      return martingale(currentBetAmount, previousResult)
    }
    if (state.strategy === BettingStrategies.DELAYED_MARTINGALE) {
      return delayedMartingale(currentBetAmount, previousResult)
    }

    if (state.strategy === BettingStrategies.PAROLI) {
      return paroli(currentBetAmount, previousResult)
    }

    if (state.strategy === BettingStrategies.DALEMBERT) {
      return dAlembert(currentBetAmount, previousResult)
    }

    return currentBetAmount
  }

  return {
    state,
    actions: {
      setStrategy,
      getNextBetAmount,
      setInitialBetAmount,
    },
  }
}
