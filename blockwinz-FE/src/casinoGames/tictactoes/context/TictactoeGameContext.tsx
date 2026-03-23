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
  /** Prevents duplicate `joinGame` from URL + hub state in the same visit. */
  const processedJoinKey = useRef<string | null>(null);

  /** Deep link: `/multiplayer/tictactoe?session=…&code=…` (optional code for private). */
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const session = params.get('session')?.trim();
    if (!session) return;
    const code = params.get('code')?.trim();
    const key = `join:url:${session}:${code ?? ''}`;
    if (processedJoinKey.current === key) return;
    processedJoinKey.current = key;
    navigate(
      { pathname: location.pathname, search: '' },
      { replace: true, state: {} },
    );
    void joinLobbyById(session, code || undefined);
  }, [location.search, location.pathname, navigate, joinLobbyById]);

  /** Join flow from `/lobbies` hub (`navigate(..., { state: { pendingJoinLobbyId } })`). */
  useEffect(() => {
    const joinId = (location.state as { pendingJoinLobbyId?: string } | null)
      ?.pendingJoinLobbyId;
    if (!joinId) return;
    const key = `join:state:${joinId}`;
    if (processedJoinKey.current === key) return;
    processedJoinKey.current = key;
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
