import React, { createContext, useContext, ReactNode } from 'react'
import useLimboState from '../hooks/useLimboState'

type GameContextProps = ReturnType<typeof useLimboState>

const GameContext = createContext<GameContextProps | undefined>(undefined)

export const LimboGameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const limboState = useLimboState()

  return <GameContext.Provider value={limboState}>{children}</GameContext.Provider>
}

export const useLimboGameContext = (): GameContextProps => {
  const context = useContext(GameContext)
  if (!context) {
    throw new Error('useGameContext must be used within a GameProvider')
  }
  return context
}
