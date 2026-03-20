import { BaseBetRequest, BaseBetResponse, GameState } from "@/shared/types/core"

export interface DiceBetRequest extends BaseBetRequest {
    rollOverBet: number
    direction: string
}

export interface DiceBetResponse extends BaseBetResponse {
    result: number
    target: number
}

export interface DiceGameState extends GameState {
    chance: string
    multiplier: string
    isSuccess: boolean
}
