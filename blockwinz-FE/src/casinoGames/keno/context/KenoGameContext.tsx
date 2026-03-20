import React, { createContext, useContext, ReactNode } from 'react'
import useKenoState from '../hooks/useKenoState'

type GameContextProps = ReturnType<typeof useKenoState>

const GameContext = createContext<GameContextProps | undefined>(undefined)

export const KenoGameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const kenoState = useKenoState()

  return <GameContext.Provider value={kenoState}>{children}</GameContext.Provider>
}

export const useKenoGameContext = (): GameContextProps => {
  const context = useContext(GameContext)
  if (!context) {
    throw new Error('useGameContext must be used within a GameProvider')
  }
  return context
}
