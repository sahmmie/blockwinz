import React, { createContext, useContext } from 'react';
import { useDiceState } from '../hooks/useDiceState';

const DiceGameContext = createContext<
  ReturnType<typeof useDiceState> | undefined
>(undefined);

export const DiceGameProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const gameControls = useDiceState();

  return (
    <DiceGameContext.Provider value={gameControls}>
      {children}
    </DiceGameContext.Provider>
  );
};

export const useDiceGameContext = (): ReturnType<typeof useDiceState> => {
  const context = useContext(DiceGameContext);
  if (!context) {
    throw new Error(
      'useDiceGameContext must be used within a GameControlsProvider',
    );
  }
  return context;
};
