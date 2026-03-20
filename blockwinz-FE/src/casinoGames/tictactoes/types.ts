import { Currency } from "@blockwinz/shared"
import { BetType } from "@/shared/types/core"

export interface TicTacToeMove {
    move: Move
}

export interface Move {
    row: number
    column: number
}

export interface IErrorMsg {
    title: string
    description: string
}

export interface TicTacToeStart {
    betAmount: number
    currency: Currency
    multiplier: RiskLevel
    isTurboMode: boolean
}

export interface TictactoeStartResponse {
    _id: string
    user: string
    board: string[][]
    betResultStatus: BET_STATUS
    multiplier: RiskLevel
    userIs: string
    aiIs: string
    currentTurn: string
    betAmount: number
    tokenHash: string
    isTurboMode: boolean
    createdAt: string
    currency: Currency
}

export interface TicTacToeMoveResponse {
    board: string[][]
    move: Move
    betResultStatus: BET_STATUS
}

export interface TictactoeActiveGameResponse {
    data: TictactoeActiveGame
}

export interface TictactoeActiveGame {
    _id: string
    user: string
    board: string[][]
    betResultStatus: BET_STATUS
    multiplier: RiskLevel
    userIs: string
    aiIs: string
    currentTurn: string
    betAmount: number
    tokenHash: string
    isTurboMode: boolean
    createdAt: string
    updatedAt: string
    currency: Currency
    __v: number
}

export enum RiskLevel {
    LOW = '1.09',
    MEDIUM = '2.98',
    HIGH = '9.99',
}

export enum BET_STATUS {
    NOT_STARTED = 'not_started',
    IN_PROGRESS = 'in_progress',
    TIE = 'tie',
    WIN = 'win',
    LOSE = 'lose',
}

export enum TICTACTOE_TILE {
    X = 'X',
    O = 'O',
}

export interface TictactoeState {
    multiplier: RiskLevel
    mode: BetType
    betAmount: number
    profitOnWin: number
    animSpeed: number
    activeAutoBet: boolean
    isLoading: boolean
    hasError: boolean
    errorMsg: IErrorMsg
    activeGameId: string | null
    currency: Currency
    betAmountErrors: { [key: string]: string | undefined }
    maxProfitErrors: { [key: string]: string | undefined }
    modalIsOpen: boolean
    cells: string[]
    betResultStatus: BET_STATUS
    userIs: string
    aiIs: string
    currentTurn: string
    tokenHash: string
    isTurboMode: boolean
    isAnimating: boolean
}