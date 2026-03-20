import React, { createContext, useContext } from 'react'
import { useGameControls } from './useGameControls'

const GameControlsContext = createContext<ReturnType<typeof useGameControls> | undefined>(undefined)

export const GameControlsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const gameControls = useGameControls()

  return (
    <GameControlsContext.Provider value={gameControls}>{children}</GameControlsContext.Provider>
  )
}

export const useGameControlsContext = () => {
  const context = useContext(GameControlsContext)
  if (!context) {
    throw new Error('useGameControlsContext must be used within a GameControlsProvider')
  }
  return context
}
