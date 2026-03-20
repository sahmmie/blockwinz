import { TagGroupItem } from "@/components/TagGroup"
import { BaseBetRequest, BaseBetResponse, BetResult, BetType, SpeedTypes } from "@/shared/types/core"

export enum LimboGameStatus {
  WIN = 'win',
  LOSE = 'lose',
}

export interface LimboBetRequest extends BaseBetRequest {
  multiplier: number
}

export interface LimboBetResponse extends BaseBetResponse {
  result: number
}

export interface GameState {
  // tabs
  mode: BetType
  // base
  profitOnWin: string
  // auto
  numberOfBets: number
  onWinIncrease: number
  onLossIncrease: number
  stopOnProfit: string
  stopOnLoss: string
  isAutoBetting: boolean
  isPlacingBet: boolean
  // game settings
  isMute: boolean
  animSpeed: number
  delayBeforeNextAutoBet: number
  delayBeforeNextBet: number
  zeroBetDelay: number
  animNormalSpeed: number
  animTurboSpeed: number
  animInstantSpeed: number
  speedType: SpeedTypes
  isAnimating: boolean
  tagResults: TagGroupItem[]
  waitForAnimation: boolean
  onWinReset: boolean
  onLossReset: boolean
}

export interface LimboGameState extends GameState {
  selectedMultiplier: string
  selectedChance: string
  resultMultiplier: string
  isBetWon: boolean
  formErrors: Record<string, string>
}

export interface LimboBetResult extends BetResult {
  result: number
}

type Action =
  | { type: 'SELECT_MULTIPLIER'; payload: string }
  | { type: 'SELECT_CHANCE'; payload: string }
  | { type: 'SET_IS_LOADING'; payload: boolean }
  | { type: 'SET_IS_BET_WON'; payload: boolean }
  | { type: 'SET_PREVIOUS_BETS'; payload: { result: number; status: boolean } }
  | { type: 'SET_RESULT_MULTIPLIER'; payload: string }
  | { type: 'SET_RESULT_STATE'; payload: string }
  | { type: 'RESET_RESULT_MULTIPLIER' }

export type { Action }
