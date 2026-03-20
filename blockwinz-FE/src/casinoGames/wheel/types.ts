import { BaseBetRequest, BaseBetResponse, GameState } from "@/shared/types/core"

export interface WheelBetRequest extends BaseBetRequest {
  segments: number
  risk: string
}

export interface WheelBetResponse extends BaseBetResponse {
  multiplier: number
}

export interface MulData {
  color: string
  mul: number
  chance: number
  sound: string
  index: number
  uid: string
}

export interface WheelGameState extends GameState {
  prevResults: MulData[]
  mulData: MulData[]
  forceUpdater: string
}
