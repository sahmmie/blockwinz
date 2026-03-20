import { BetHistoryT, SeedT } from '@/pages/BetHistory/BetHistory.type';
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
  const [baseInputs, setBaseInputs] = useState<BaseFairLogicGenerateForGameDto>(
    {
      clientSeed: (betHistory?.gameId?.seed as SeedT)?.clientSeed || '',
      serverSeed: (betHistory?.gameId?.seed as SeedT)?.serverSeed || '',
      nonce: (betHistory?.gameId.nonce as number) || 0,
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
