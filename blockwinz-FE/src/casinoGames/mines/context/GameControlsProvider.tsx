import React from 'react'
import { useGameControlsState } from '../hooks/gameControlsState'
import { GameControlsContext } from './GameControlsContextDefinition'

export const GameControlsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { state, actions } = useGameControlsState()

  return (
    <GameControlsContext.Provider value={{ state, actions }}>
      {children}
    </GameControlsContext.Provider>
  )
}
