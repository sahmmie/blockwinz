import { GameMode } from "@/shared/enums/gameMode.enum"
import { KenoBetResponse } from "../api/types"

type Risk = 'classic' | 'low' | 'medium' | 'high'

export type PercentageInputToggleButtonType = 'reset' | 'increaseBy'

interface KenoGameState {
  selectedNumbers: number[]
  typeOfPlay: GameMode
  betAmount: number
  riskDropdownValue: Risk
  numberOfBetsValue: string
  onWinValue: number
  onLossValue: number
  onWinToggleValue: PercentageInputToggleButtonType
  onLossToggleValue: PercentageInputToggleButtonType
  stopOnProfit: string
  stopOnLoss: string
  isAutoPicking: boolean
  isAutoBetting: boolean
  betResponse: KenoBetResponse
  isBetting: boolean
  showMaxProfitModal: boolean
}

type Action =
  | { type: 'SELECT_NUMBER'; payload: number }
  | { type: 'SET_TYPE_OF_PLAY'; payload: GameMode }
  | { type: 'SET_BET_AMOUNT'; payload: number }
  | { type: 'SET_RISK_DROPDOWN_VALUE'; payload: Risk }
  | { type: 'SET_NUMBER_OF_BETS_VALUE'; payload: string }
  | { type: 'SET_ON_WIN_VALUE'; payload: number }
  | { type: 'SET_ON_LOSS_VALUE'; payload: number }
  | { type: 'SET_STOP_ON_PROFIT'; payload: string }
  | { type: 'SET_STOP_ON_LOSS'; payload: string }
  | { type: 'SET_IS_AUTO_PICKING'; payload: boolean }
  | { type: 'ADD_RESULT_NUMBER'; payload: number }
  | { type: 'SET_IS_AUTO_BETTING'; payload: boolean }
  | { type: 'SET_BET_RESPONSE'; payload: KenoBetResponse }
  | { type: 'SET_IS_BETTING'; payload: boolean }
  | { type: 'CLEAR_NUMBERS' }
  | { type: 'RESET_RESULT_NUMBERS' }
  | { type: 'CLEAR_BET_RESPONSE' }
  | { type: 'SET_SELECTED_NUMBERS'; payload: number[] }
  | { type: 'SET_ON_WIN_TOGGLE_VALUE'; payload: PercentageInputToggleButtonType }
  | { type: 'SET_ON_LOSS_TOGGLE_VALUE'; payload: PercentageInputToggleButtonType }
  | { type: 'SET_SHOW_MAX_PROFIT_MODAL'; payload: boolean }

export type { Action, KenoGameState, Risk }
