import React, { createContext, useContext } from 'react';
import { useTictactoeState } from '../hooks/useTictactoeState';

const TictactoeGameContext = createContext<
  ReturnType<typeof useTictactoeState> | undefined
>(undefined);

export const TictactoeGameProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const gameControls = useTictactoeState();

  return (
    <TictactoeGameContext.Provider value={gameControls}>
      {children}
    </TictactoeGameContext.Provider>
  );
};

export const useTictactoeGameContext = (): ReturnType<typeof useTictactoeState> => {
  const context = useContext(TictactoeGameContext);
  if (!context) {
    throw new Error(
      'useTictactoeGameContext must be used within a GameControlsProvider',
    );
  }
  return context;
};
