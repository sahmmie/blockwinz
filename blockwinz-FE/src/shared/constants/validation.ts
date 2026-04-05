import * as Yup from 'yup'
import { CurrencyMax } from '@/shared/types/core'
import { Currency } from '@blockwinz/shared'
import { GameTypeEnum } from '@blockwinz/shared'

export const MIN_MULTIPLIER = 1.0102
export const MAX_MULTIPLIER = 9900
export const MIN_CHANCE = 0.01
export const MAX_CHANCE = 98
export const MAX_ROLL_OVER_BET = 99.99
export const MIN_ROLL_OVER_BET = 2
export const MIN_ROLL_UNDER_BET = 0.01
export const MAX_ROLL_UNDER_BET = 98
export const MAX_ON_LOSS_PERCENTAGE = 10000
export const MAX_ON_WIN_PERCENTAGE = 10000
export const MAX_TAG_RESULTS = 5

export const HOUSE_EDGE = 0.01
export const MINES_GAME_TILES_COUNT = 25

export type GameTypesWithMultiplier = GameTypeEnum.DiceGame | GameTypeEnum.LimboGame

export const gameLimits = {
  [GameTypeEnum.DiceGame]: {
    MIN_MULTIPLIER: 1.0102,
    MAX_MULTIPLIER: 9900,
    MIN_CHANCE: 0.01,
    MAX_CHANCE: 98,
    MAX_ROLL_OVER_BET: 99.99,
    MIN_ROLL_OVER_BET: 2,
    MIN_ROLL_UNDER_BET: 0.01,
    MAX_ROLL_UNDER_BET: 98,
  },
  [GameTypeEnum.LimboGame]: {
    MIN_MULTIPLIER: 1.01,
    MAX_MULTIPLIER: 1000000,
    MIN_CHANCE: 0.000099,
    MAX_CHANCE: 98.02,
  },
}

export type ErrorsSchema = Partial<Record<string, string>>

export const getMultiplierValidationSchema = (min: number, max: number) => {
  return Yup.object().shape({
    multiplier: Yup.number()
      .transform((value) => (Number.isNaN(value) ? undefined : value))
      .min(min, `Multiplier must be greater than or equal to ${min}`)
      .max(max, `Multiplier must be less than or equal to ${max}`)
      .required('Multiplier is required'),
  })
}

export const getChanceValidationSchema = (min: number, max: number) => {
  return Yup.object().shape({
    chance: Yup.number()
      .transform((value) => (Number.isNaN(value) ? undefined : value))
      .min(min, `Chance must be greater than ${min}`)
      .max(max, `Chance must be less than ${max}`)
      .required(`Chance is required`),
  })
}

export const getRollOverValidationSchema = (min: number, max: number) => {
  return Yup.object().shape({
    rollOverBet: Yup.number()
      .transform((value) => (Number.isNaN(value) ? undefined : value))
      .min(min, `Roll over bet must be greater than ${min}`)
      .max(max, `Roll over bet must be less than ${max}`)
      .required(`Roll over bet is required`),
  })
}

export const getCommonValidationSchema = () => {
  return Yup.object().shape({
    onWinPercentage: Yup.number()
      .min(0, `On win percentage must be greater than 0`)
      .max(
        MAX_ON_WIN_PERCENTAGE,
        `On win percentage must be less than ${MAX_ON_WIN_PERCENTAGE}`
      )
      .required(`On win percentage is required`),
    onLossPercentage: Yup.number()
      .min(0, `On loss percentage must be greater than 0`)
      .max(
        MAX_ON_LOSS_PERCENTAGE, `On loss percentage must be less than ${MAX_ON_LOSS_PERCENTAGE}`
      )
      .required(`On loss percentage is required`),
  })
}

export const currencyMaxTable: Record<Currency, CurrencyMax> = {
  [Currency.SOL]: { bet: 100.0, profit: 100.0 },
  [Currency.BWZ]: { bet: 1000000.0, profit: 1000000.0 },
  [Currency.USDT]: { bet: 10000.0, profit: 100000.0 },
}

export const betAmountValidationSchema = (playerBalance: number | undefined) => {
  return Yup.object().shape({
    betAmount: Yup.number()
      .transform((value: string) => (isNaN(parseFloat(value)) ? undefined : parseFloat(value)))
      .max(playerBalance || 0, 'Bet amount exceeds your balance'),
  })
}

export const maxProfitValidationSchema = (currency: Currency, multiplier: number) => {
  const currencyMax = currencyMaxTable[currency]
  return Yup.object().shape({
    betAmount: Yup.number()
      .transform((betAmount: string) =>
        isNaN(parseFloat(betAmount))
          ? undefined
          : parseFloat(betAmount) * multiplier - parseFloat(betAmount)
      )
      .max(currencyMax?.profit, 'Bet amount exceeds maximum payout amount'),
  })
}
