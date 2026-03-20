import { createContext } from 'react'
import { IGameControlsState } from '../types'
import { useGameControlsState } from '../hooks/gameControlsState'

export interface GameControlsContextType {
  state: IGameControlsState
  actions: ReturnType<typeof useGameControlsState>['actions']
}

export const GameControlsContext = createContext<GameControlsContextType | undefined>(undefined)
