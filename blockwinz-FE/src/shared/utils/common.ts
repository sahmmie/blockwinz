import { ExtendedGameState } from "@/shared/types/types"
import * as Yup from 'yup'
import {
    currencyMaxTable,
    ErrorsSchema,
    gameLimits,
    GameTypesWithMultiplier,
    getChanceValidationSchema,
    getMultiplierValidationSchema,
    MAX_CHANCE,
    MAX_MULTIPLIER,
    MAX_ROLL_OVER_BET,
    MAX_ROLL_UNDER_BET,
    MIN_CHANCE,
    MIN_MULTIPLIER,
    MIN_ROLL_OVER_BET,
    MIN_ROLL_UNDER_BET,
    MINES_GAME_TILES_COUNT
} from "../constants/validation"
import { Currency } from "../enums/currency.enum"
import {
    BaseBetRequest,
    BaseBetResponse,
    CurrencyMax,
    GameState,
    GameStateWithMultiplier,
    MultiplierState
} from "../types/core"
import { GameMode } from "../enums/gameMode.enum"
import { DEFAULT_CURRENCY, DEFAULT_ROUNDING_DECIMALS } from "../constants/app.constant"

export const TOTAL_PROBABILITY = 100
export const HOUSE_EDGE = 1 // 1% house edge
export const INITIAL_MULTIPLIER = '2.0000'
export const INITIAL_CHANCE = '49.5000'
export const INITIAL_ROLL_OVER_BET = 50.5

export const parseFloatValue = (
    inputValue: string | number,
    decimals = DEFAULT_ROUNDING_DECIMALS,
    enforceDecimals = true
): number => {
    const normalizedValue = inputValue.toString().replace(',', '.')
    const parsedValue = parseFloat(normalizedValue)

    if (isNaN(parsedValue)) {
        return 0
    }
    
    if (enforceDecimals) {
        const multiplier = Math.pow(10, decimals)
        return Math.trunc(parsedValue * multiplier) / multiplier
    }
    
    return parsedValue
}

export const checkHasErrors = (obj: object): boolean => {
    if (!obj) return false

    return Object.values(obj).some(
        (value) =>
            value !== null &&
            value !== undefined &&
            (typeof value !== 'object' || Object.keys(value).length > 0)
    )
}

export const getCurrencyMax = (currency: Currency, type: keyof CurrencyMax): number =>
    currencyMaxTable[currency]
        ? currencyMaxTable[currency][type]
        : currencyMaxTable[DEFAULT_CURRENCY][type]

export const createMaxAmountValidationSchema = (
    currency: Currency,
    type: keyof CurrencyMax,
    error: 'maxProfit' | 'maxAmount' = 'maxAmount'
) => {
    const maxAmount = getCurrencyMax(currency, type)
    const errMsg = error === 'maxProfit' ? 'Maximum profit exceeded' : 'Maximum bet amount exceeded'

    return Yup.object().shape({
        [type]: Yup.number()
            .typeError('Must be a number')
            .max(maxAmount, `${errMsg}`)
    })
}

export const calculateNewBetAmount = (
    currentBetAmount: number,
    adjustmentPercentage: number,
    initialBetAmount: number,
    resetAmount: boolean
): number => {
    if (resetAmount) {
        return initialBetAmount
    }
    return adjustmentPercentage === 0 && !resetAmount
        ? currentBetAmount
        : currentBetAmount * (1 + adjustmentPercentage / 100)
}

export const checkIsBetDisabled = (
    state: GameStateWithMultiplier,
    errors: ErrorsSchema,
    waitForAnimation = false
) => {
    const hasErrors = checkHasErrors(errors)

    const isBetEmpty = isNaN(parseFloat(state.betAmount))

    const shouldWaitForAnimation = waitForAnimation && state.isAnimating

    if (state.mode === GameMode.Manual) {
        return state.isPlacingBet || hasErrors || isBetEmpty || shouldWaitForAnimation
    }

    return (
        (!state.isAutoBetting && state.isPlacingBet) ||
        (!state.isAutoBetting && shouldWaitForAnimation) ||
        hasErrors ||
        isBetEmpty
    )
}

export const getDelayBeforeNextBet = (
    state: ExtendedGameState<GameState, BaseBetRequest, BaseBetResponse>
) => {
    const waitForAnimSpeed = state.waitForAnimation ? state.animSpeed : 0
    const nextBetDelay =
        state.mode === GameMode.Manual ? state.delayBeforeNextBet : state.delayBeforeNextAutoBet

    const betDelay = waitForAnimSpeed + nextBetDelay

    if (Number(state.betAmount) === 0) {
        return state.zeroBetDelay + betDelay
    }

    return betDelay
}

export const getMultiplierStateValidationSchema = (gameType: GameTypesWithMultiplier) => {
    const limits = gameLimits[gameType]
    return Yup.object().shape({
        multiplier: getMultiplierValidationSchema(limits.MIN_MULTIPLIER, limits.MAX_MULTIPLIER).fields
            .multiplier,
        chance: getChanceValidationSchema(limits.MIN_CHANCE, limits.MAX_CHANCE).fields.chance,
    })
}

export const initialMultiplierState: MultiplierState = {
    multiplier: INITIAL_MULTIPLIER,
    rollOverBet: INITIAL_ROLL_OVER_BET,
    chance: INITIAL_CHANCE,
    direction: 'over',
}

export const calculateState = (
    inputType: 'multiplier' | 'chance' | 'rollOverBet',
    inputValue: string | number,
    direction: 'under' | 'over'
): MultiplierState => {
    let multiplier: number, chance: number, rollOverBet: number
    switch (inputType) {
        case 'multiplier':
            multiplier = parseNumberString(inputValue as string)
            chance = calculateChance(multiplier)
            rollOverBet = getRollOverBetByChance(chance, direction)
            break
        case 'chance':
            chance = parseNumberString(inputValue as string)
            multiplier = calculateMultiplier(chance)
            rollOverBet = getRollOverBetByChance(chance, direction)
            break
        case 'rollOverBet':
            rollOverBet = inputValue as number
            chance = direction === 'over' ? TOTAL_PROBABILITY - rollOverBet : rollOverBet
            multiplier = calculateMultiplier(chance)
            break
    }

    const rollValueLimits = getRollValueLimits(direction)

    rollOverBet = clamp(rollOverBet, rollValueLimits.min, rollValueLimits.max)

    return {
        multiplier:
            inputType === 'multiplier' ? (inputValue as string) : formatNumber(multiplier, 'multiplier'),
        chance: inputType === 'chance' ? (inputValue as string) : formatNumber(chance, 'chance'),
        rollOverBet: inputType === 'rollOverBet' ? (inputValue as number) : rollOverBet,
        direction,
    }
}

export const calculateChance = (multiplier: number): number => {
    return !multiplier ? 0 : ((TOTAL_PROBABILITY - HOUSE_EDGE) / multiplier * 100) / 100
}

export const calculateMultiplier = (chance: number): number => {
    return !chance ? 0 : (TOTAL_PROBABILITY - HOUSE_EDGE) / chance
}

export const getRollOverBetByChance = (chance: number, direction: 'under' | 'over'): number => {
    return direction === 'over' ? TOTAL_PROBABILITY - chance : chance
}

export const clamp = (value: number, min: number, max: number): number => {
    return Math.min(Math.max(value, min), max)
}

export const parseNumberString = (value: string): number => {
    const parsed = parseFloat(value)
    return isNaN(parsed) ? 0 : parsed
}

export const formatNumber = (value: number, type: 'multiplier' | 'chance'): string => {
    switch (type) {
        case 'multiplier':
            return value.toFixed(4);

        case 'chance':
            {
                const decimalPlaces = value > 0.000099 ? 4 : 6;
                return value.toFixed(decimalPlaces);
            }

        default:
            return value.toString();
    }
};

export const adjustMultiplierForEdgeCases = (multiplier: number): number => {
    return clamp(multiplier, MIN_MULTIPLIER, MAX_MULTIPLIER)
}

export const adjustChanceForEdgeCases = (chance: number): number => {
    return clamp(chance, MIN_CHANCE, MAX_CHANCE)
}

export const getRollValueLimits = (direction: 'over' | 'under') => {
    return {
        min: direction === 'over' ? MIN_ROLL_OVER_BET : MIN_ROLL_UNDER_BET,
        max: direction === 'over' ? MAX_ROLL_OVER_BET : MAX_ROLL_UNDER_BET,
    }
}

export interface GetFormattedValueParams {
    value: string
    maxValue?: number
    numbersOnly?: boolean
}

export const getFormattedValue = ({
    value,
    maxValue = Number.MAX_SAFE_INTEGER,
    numbersOnly,
}: GetFormattedValueParams): string => {
    if (!numbersOnly || !value) {
        return value
    }

    let formattedValue = value
    // Allow non-negative numbers including decimals, comma, and period
    const regex = /^-?\d*[.,]?\d*$/
    if (!regex.test(value) && value !== '') {
        return ''
    }

    // Convert comma to period for consistent number format

    formattedValue = value.toString().replace(',', '.')

    // Handle max value constraint
    if (Number(formattedValue) > maxValue) {
        return maxValue.toString()
    }

    // If we haven't returned yet, return the original formatted value
    return formattedValue
}

export const getProfitOnWin = (betAmount: string, multiplier: string): string => {
    if (Number(multiplier) <= 0 || Number(betAmount) <= 0) {
        return '0'
    }

    return (parseFloat(betAmount) * parseFloat(multiplier) - parseFloat(betAmount)).toString()
}

export const getNewSliderValue = (value: number) => {
    return Math.max(Math.min(value, 98), 2)
}

/**
 * Calculate the win multiplier for the game
 * @param openedMines Number of mines opened
 * @param minesCount Total number of mines
 * @private
 * @memberof MinesService
 * @method calculateWinMultiplier
 * @return number
 */
export const calculateWinMultiplier = (openedMines: number, minesCount: number) => {
    const n = MINES_GAME_TILES_COUNT // Total number of tiles
    const x = n - minesCount // Number of tiles without mines
    const d = openedMines // Number of tiles revealed

    // If no tiles have been revealed, the win multiplier is 1
    if (d === 0) return 1

    // Function to calculate factorial
    function factorial(number: number): number {
        let value = 1
        for (let i = 2; i <= number; i++) {
            value *= i
        }
        return value
    }

    // Function to calculate combinations (n choose k)
    function combination(a: number, b: number): number {
        if (b > a) return 0 // Return 0 if b is greater than a (invalid case)
        if (b === 0 || b === a) return 1 // C(a, 0) and C(a, a) are both 1
        return factorial(a) / (factorial(b) * factorial(a - b)) // Calculate combination using factorials
    }

    // Calculate combinations for total tiles and revealed tiles
    const first = combination(n, d)
    // Calculate combinations for tiles without mines and revealed tiles
    const second = combination(x, d)

    // Calculate the win multiplier with the house edge adjustment
    const result = (1 - HOUSE_EDGE) * (first / second)

    // Round the result to two decimal places and Return the final win multiplier
    return Math.round(result * 100) / 100
}

export const asyncDelay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const formatDate = (dateStr: Date) => {
    const date = new Date(dateStr);
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();

    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'

    const hh = String(hours).padStart(2, '0');

    return `${dd}/${mm}/${yyyy}, ${hh}:${minutes}:${seconds} ${ampm}`;
}