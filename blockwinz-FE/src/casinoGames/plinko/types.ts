import { BaseBetRequest, BaseBetResponse, GameState } from "@/shared/types/core"

export interface PlinkoBetRequest extends BaseBetRequest {
  rows: number
  risk: string
}

export interface PlinkoBetResponse extends BaseBetResponse {
  results: number[]
  multiplier: number
}

export interface BucketData {
  color: string
  label: string
  index: number
  uid: string
}

export interface PlinkoGameState extends GameState {
  prevResults: BucketData[]
  bucketData: BucketData[]
  bucketsContainerP: number
  onBucketEnter: (bucketI: number) => void
}

export interface PathData {
  [rows: number]: {
    [bucket: number]: string[] // Array of compressed path strings
  }
}