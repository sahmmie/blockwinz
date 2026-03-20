import { Currency } from "@blockwinz/shared"
import { GameMode } from "@blockwinz/shared"

export interface IMinesReveal {
  gameId: string
  position: number
}

export interface IErrorMsg {
  title: string
  description: string
}
export interface IMinesCashout {
  gameId: string
}
export interface IMinesStart {
  minesCount: number
  currency: Currency
  betAmount: number
  stopOnProfit: number
  stopOnLoss: number
  increaseBy: number
  decreaseBy: number
  isManualMode: boolean
  isTurboMode: boolean
}
export interface ITile {
  isRevealed: boolean
  isSelected: boolean
  content: string
}

export interface IGameControlsState {
  betType: GameMode
  betAmount: number
  totalProfit: number
  nextTotalProfit: number
  onWinValue: number
  onLossValue: number
  onWinReset: boolean
  onLossReset: boolean
  numberOfBets: number
  stopOnProfit: number
  stopOnLoss: number
  minesCount: number
  gemsCount: number
  multiplier: number
  animSpeed: number
  stopAutoBet: boolean
  activeBet: boolean
  activeAutoBet: boolean
  showPopUp: boolean
  activeBoard: boolean
  isLoading: boolean
  isLoadingTile: boolean[]
  isLoadingReveal: boolean
  isLoadingCashout: boolean
  isLoadingAutoBet: boolean
  hasError: boolean
  errorMsg: IErrorMsg
  activeGameId: string
  currency: Currency
  nextWinMultiplier: number
  selectedTiles: number[]
  tiles: ITile[]
  betAmountErrors: { [key: string]: string | undefined }
  maxProfitErrors: { [key: string]: string | undefined }
  manualSelectedTiles: number[]
  modalIsOpen: boolean
}

export interface IMinesStartResponse {
  betAmount: number
  betResultStatus: string
  createdAt: string
  currency: Currency
  id: string
  minesCount: number
  minesResult: number[]
  selected: number[]
  multiplier: number
  nextWinMultiplier: number
}

export interface IMinesRevealResponse {
  betResultStatus: string
  createdAt: string
  currency: Currency
  id: string
  minesCount: number
  betAmount: number
  minesResult: number[]
  selected: number[]
  multiplier: number
  nextWinMultiplier: number
}
export interface IMinesCashoutResponse {
  betResultStatus: string
  createdAt: string
  id: string
  currency: Currency
  minesCount: number
  betAmount: number
  minesResult: number[]
  selected: number[]
  multiplier: number
  nextWinMultiplier: number
}

export interface IActiveGameResponse {
  data: IMinesCashoutResponse
}
