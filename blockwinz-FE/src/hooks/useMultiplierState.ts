import { useState } from 'react'

import { GameTypesWithMultiplier } from '@/shared/constants/validation'
import { MultiplierState } from '@/shared/types/core'
import { calculateState, getMultiplierStateValidationSchema, initialMultiplierState, TOTAL_PROBABILITY } from '@/shared/utils/common'
import { useValidation } from './useValidation'

export const useMultiplierState = (gameType: GameTypesWithMultiplier) => {
  const multiplierValidationSchema = getMultiplierStateValidationSchema(gameType)
  const [state, setState] = useState<MultiplierState>(initialMultiplierState)
  const { errors, handleBlur } = useValidation({
    values: { multiplier: state.multiplier, chance: state.chance },
    validationSchema: multiplierValidationSchema,
    validateOnChange: true,
  })

  const setMultiplier = (mul: string) =>
    setState(calculateState('multiplier', mul, state.direction))

  const setChance = (newChance: string) =>
    setState(calculateState('chance', newChance, state.direction))

  const setRollOverBet = (newRollOverBet: number) =>
    setState(calculateState('rollOverBet', newRollOverBet, state.direction))

  const toggleRollOver = () =>
    setState((prevState) => {
      const newDirection = prevState.direction === 'over' ? 'under' : 'over'
      const newRollOverBet = TOTAL_PROBABILITY - prevState.rollOverBet
      return calculateState('rollOverBet', newRollOverBet, newDirection)
    })

  return {
    ...state,
    toggleRollOver,
    setMultiplier,
    setChance,
    setRollOverBet,
    errors,
    handleBlur,
  }
}
