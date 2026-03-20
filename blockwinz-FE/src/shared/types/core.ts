import { TagGroupItem } from "@/components/TagGroup"
import { Currency } from "@blockwinz/shared"
import { GameMode } from "@blockwinz/shared"

export type BaseHotkeyConfigs = Record<BaseHotKeyType, HotkeyConfig>

export type HotkeyConfigs = Partial<BaseHotkeyConfigs> & Record<string, HotkeyConfig>

export type BaseHotKeyType = 'placeBet' | 'doubleBet' | 'halveBet'

export type HotKey = 'space' | 'w' | 's' | 'c'

export interface HotkeyConfig {
    title: string
    hotkeyLabel: string
    hotKeyValue: string
    onKeyActive: () => void
    isDisabled?: boolean
}

export type BetType = GameMode

export enum SpeedTypes {
    NORMAL,
    TURBO,
    INSTANT,
}

export enum BetStatus {
    WIN = 'win',
    LOSE = 'lose',
}

export interface BetResult {
    handleBetResult: BetStatus
    profit: number
}

export interface BaseBetRequest {
    betAmount: string
    currency: Currency
    stopOnProfit: string
    stopOnLoss: string
    increaseBy: string
    decreaseBy: string
    isManualMode: boolean
    isTurboMode: boolean
}

export interface BaseBetResponse {
    betResultStatus: BetStatus
}

export interface CurrencyMax {
    bet: number
    profit: number
}

export interface GameStateWithMultiplier
    extends GameState,
    BaseBetRequest,
    BaseBetResponse,
    MultiplierState { }


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

export interface MultiplierState {
    multiplier: string
    rollOverBet: number
    chance: string
    direction: 'under' | 'over'
}

export enum BettingStrategies {
    MARTINGALE = 'MARTINGALE',
    DELAYED_MARTINGALE = 'DELAYED_MARTINGALE',
    PAROLI = 'PAROLI',
    DALEMBERT = 'DALEMBERT',
}

export interface CurrencyInfo {
  availableBalance: number;
    icon: string
    currency: Currency
    decimals: number
    withdrawalFee?: number
}


export interface WalletInfo {
    user: string;
    address: string;
    publicKey: string;
    currency: Currency;
    chain: string;
}


export type GameResult = number | number[] | boolean

export interface BaseFairLogicGenerateForGameDto {
  serverSeed: string
  clientSeed: string
  nonce: number
}

export interface GenerateFairLogicResultPlinkoDto extends BaseFairLogicGenerateForGameDto {
  risk: 'LOW' | 'MEDIUM' | 'HIGH'
  rows: number
}

export interface GenerateFairLogicResultWheelDto extends BaseFairLogicGenerateForGameDto {
  risk: 'LOW' | 'MEDIUM' | 'HIGH'
  segments: number
}

export interface GenerateFairLogicResultMinesDto extends BaseFairLogicGenerateForGameDto {
  mines: number
}

export interface FairLogicGenerateFloatsDto extends BaseFairLogicGenerateForGameDto {
  count: number
  cursor: number
}

export interface FairLogicByteGeneratorDto {
  serverSeed: string
  clientSeed: string
  nonce: number
  cursor: number
}

export interface FairLogicBytesToFloatsDto {
  bytes: number[]
}