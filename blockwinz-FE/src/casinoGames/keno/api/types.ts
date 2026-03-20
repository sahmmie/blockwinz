import { Currency } from "@/shared/enums/currency.enum"

export enum KenoEndpoints {
  Bet = '/keno/bet',
  RiskData = '/keno/risk-data',
}

export interface KenoBetRequest {
  betAmount: number
  currency: Currency
  selectedNumbers: number[]
  risk: string
  stopOnProfit: number
  stopOnLoss: number
  increaseBy: number
  decreaseBy: number
  isManualMode: boolean
  isTurboMode: boolean
}

export interface KenoBetResponse {
  balance?: number
  status: 'win' | 'loss'
  multiplier: number
  result: number[]
  hits: number
  totalWinAmount: number
}

export enum RiskLevel {
  CLASSIC = 'classic',
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}