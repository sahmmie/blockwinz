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
  useEffect,
  useRef,
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
  /** Merged after bet/legacy seeds (e.g. from URL). */
  seedDefaultsFromUrl?: Partial<BaseFairLogicGenerateForGameDto> | null;
  /** Debounced sync when user edits seeds/nonce (optional). */
  onBaseInputsCommit?: (inputs: BaseFairLogicGenerateForGameDto) => void;
}

function buildInitialBaseInputs(
  betHistory: BetHistoryT | undefined,
  url: Partial<BaseFairLogicGenerateForGameDto> | null | undefined,
): BaseFairLogicGenerateForGameDto {
  const legacyGame =
    betHistory && isPopulatedGame(betHistory.gameId)
      ? betHistory.gameId
      : null;
  const seed = legacyGame?.seed as SeedT | undefined;
  return {
    clientSeed:
      seed?.clientSeed ||
      betHistory?.clientSeed ||
      url?.clientSeed ||
      '',
    serverSeed:
      seed?.serverSeed ||
      betHistory?.serverSeed ||
      url?.serverSeed ||
      '',
    nonce:
      legacyGame?.nonce ??
      betHistory?.nonce ??
      url?.nonce ??
      0,
  };
}

const GameInputsProvider: React.FC<GameInputsProviderProps> = ({
  children,
  betHistory,
  seedDefaultsFromUrl,
  onBaseInputsCommit,
}) => {
  const [baseInputs, setBaseInputs] = useState<BaseFairLogicGenerateForGameDto>(
    () => buildInitialBaseInputs(betHistory, seedDefaultsFromUrl),
  );

  const commitTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setBaseInputs(prev => {
        const next = {
          ...prev,
          [name]: name === 'nonce' ? Number(value) : value,
        };
        if (onBaseInputsCommit) {
          if (commitTimer.current) clearTimeout(commitTimer.current);
          commitTimer.current = setTimeout(() => {
            onBaseInputsCommit(next);
            commitTimer.current = null;
          }, 350);
        }
        return next;
      });
    },
    [onBaseInputsCommit],
  );

  useEffect(
    () => () => {
      if (commitTimer.current) clearTimeout(commitTimer.current);
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
