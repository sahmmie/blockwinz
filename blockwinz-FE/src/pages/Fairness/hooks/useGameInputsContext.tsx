import {
  BetHistoryT,
  SeedT,
  isPopulatedGame,
} from '@/pages/BetHistory/BetHistory.type';
import { BaseFairLogicGenerateForGameDto } from '@/shared/types/core';
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from 'react';

interface GameInputsContextProps {
  baseInputs: BaseFairLogicGenerateForGameDto;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const GameInputsContext = createContext<GameInputsContextProps | undefined>(
  undefined,
);

interface GameInputsProviderProps {
  children: ReactNode;
  betHistory?: BetHistoryT;
}

const GameInputsProvider: React.FC<GameInputsProviderProps> = ({
  children,
  betHistory,
}) => {
  const legacyGame =
    betHistory && isPopulatedGame(betHistory.gameId)
      ? betHistory.gameId
      : null;
  const seed = legacyGame?.seed as SeedT | undefined;
  const [baseInputs, setBaseInputs] = useState<BaseFairLogicGenerateForGameDto>(
    {
      clientSeed:
        seed?.clientSeed || betHistory?.clientSeed || '',
      serverSeed:
        seed?.serverSeed || betHistory?.serverSeed || '',
      nonce: legacyGame?.nonce ?? betHistory?.nonce ?? 0,
    },
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setBaseInputs(prev => ({
        ...prev,
        [name]: name === 'nonce' ? Number(value) : value,
      }));
    },
    [],
  );

  return (
    <GameInputsContext.Provider value={{ baseInputs, handleInputChange }}>
      {children}
    </GameInputsContext.Provider>
  );
};

const useGameInputsContext = () => {
  const context = useContext(GameInputsContext);
  if (!context) {
    throw new Error(
      'useGameInputsContext must be used within a GameInputsProvider',
    );
  }
  return context;
};

export { GameInputsProvider, useGameInputsContext };
