/* eslint-disable react-refresh/only-export-components -- provider shares hook + types */
import React, { createContext, useContext, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useMultiplayerTictactoe } from '../hooks/useMultiplayerTictactoe';
import { toaster } from '@/components/ui/toaster';

type MpReturn = ReturnType<typeof useMultiplayerTictactoe>;

export type TictactoeGameContextValue = {
  opponentLabel: string;
  state: MpReturn['state'];
  actions: MpReturn['actions'] & {
    handleSelectCell: (cellIndex: number) => void;
  };
};

const TictactoeGameContext = createContext<TictactoeGameContextValue | undefined>(
  undefined,
);

export const TictactoeGameProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const mp = useMultiplayerTictactoe();
  const { joinLobbyById } = mp.actions;
  const location = useLocation();
  const navigate = useNavigate();
  const hubJoinProcessed = useRef<string | null>(null);

  /** Join flow from `/lobbies` hub (`navigate(..., { state: { pendingJoinLobbyId } })`). */
  useEffect(() => {
    const joinId = (location.state as { pendingJoinLobbyId?: string } | null)
      ?.pendingJoinLobbyId;
    if (!joinId || hubJoinProcessed.current === joinId) return;
    hubJoinProcessed.current = joinId;
    navigate(
      { pathname: location.pathname, search: location.search },
      { replace: true, state: {} },
    );
    void joinLobbyById(joinId);
  }, [location.state, location.pathname, location.search, navigate, joinLobbyById]);

  const handleSelectCell = (cellIndex: number) => {
    if (mp.state.mpPhase !== 'playing') {
      if (mp.state.mpPhase === 'lobby') {
        toaster.create({
          title: 'Waiting for opponent',
          type: 'info',
        });
      }
      return;
    }
    if (mp.state.currentTurn !== mp.state.userIs) {
      toaster.create({
        title: "Opponent's turn",
        type: 'info',
      });
      return;
    }
    if (mp.state.cells[cellIndex]) return;
    void mp.actions.sendMove(cellIndex);
  };

  const value: TictactoeGameContextValue = {
    opponentLabel: 'Opponent',
    state: mp.state,
    actions: {
      ...mp.actions,
      handleSelectCell,
    },
  };

  return (
    <TictactoeGameContext.Provider value={value}>
      {children}
    </TictactoeGameContext.Provider>
  );
};

export const useTictactoeGameContext = (): TictactoeGameContextValue => {
  const context = useContext(TictactoeGameContext);
  if (!context) {
    throw new Error(
      'useTictactoeGameContext must be used within a TictactoeGameProvider',
    );
  }
  return context;
};
