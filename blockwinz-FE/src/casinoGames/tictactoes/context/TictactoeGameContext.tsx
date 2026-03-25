/* eslint-disable react-refresh/only-export-components -- provider shares hook + types */
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
} from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSocketContext } from '@/context/socketContext';
import { useMultiplayerTictactoe } from '../hooks/useMultiplayerTictactoe';
import { MpPhase } from '../types';
import { toaster } from '@/components/ui/toaster';

const SOCKET_WAIT_MS = 15_000;

function waitForSocketConnected(
  getSocketInstance: () => ReturnType<
    ReturnType<typeof useSocketContext>['getSocketInstance']
  >,
  timeoutMs: number,
): Promise<void> {
  return new Promise((resolve) => {
    const sock = getSocketInstance();
    if (!sock) {
      window.setTimeout(resolve, timeoutMs);
      return;
    }
    if (sock.connected) {
      resolve();
      return;
    }
    const timer = window.setTimeout(() => {
      sock.off('connect', onConnect);
      resolve();
    }, timeoutMs);
    const onConnect = () => {
      window.clearTimeout(timer);
      sock.off('connect', onConnect);
      resolve();
    };
    sock.on('connect', onConnect);
  });
}

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
  const { getSocketInstance } = useSocketContext();
  const location = useLocation();
  const navigate = useNavigate();

  const activeSessionIdRef = useRef<string | null>(null);
  activeSessionIdRef.current = mp.state.activeGameId ?? null;

  const waitForGameSocket = useCallback(() => {
    return waitForSocketConnected(getSocketInstance, SOCKET_WAIT_MS);
  }, [getSocketInstance]);

  /**
   * Keep `?session=` (and `?code=` when private host or invite link) while in lobby or live play
   * so refresh restores context; clear when idle.
   */
  useEffect(() => {
    const id = mp.state.activeGameId;
    const phase = mp.state.mpPhase;
    const hostCode = mp.state.hostInvite?.plaintextJoinCode?.trim();

    const current = new URLSearchParams(
      location.search.startsWith('?')
        ? location.search.slice(1)
        : location.search,
    );

    const persist =
      Boolean(id) &&
      (phase === MpPhase.Lobby || phase === MpPhase.Playing);

    if (!persist) return;

    const next = new URLSearchParams();
    next.set('session', id!);
    const existingCode = current.get('code')?.trim();
    if (hostCode) next.set('code', hostCode);
    else if (existingCode) next.set('code', existingCode);
    const nextStr = next.toString();
    if (current.toString() !== nextStr) {
      navigate(
        {
          pathname: location.pathname,
          search: nextStr ? `?${nextStr}` : '',
        },
        { replace: true },
      );
    }
  }, [
    mp.state.activeGameId,
    mp.state.mpPhase,
    mp.state.hostInvite?.plaintextJoinCode,
    location.pathname,
    location.search,
    navigate,
  ]);

  /**
   * Deep link: `/multiplayer/tictactoe?session=…&code=…` (optional code for private).
   * Skips if already in that session (e.g. host after create or refresh). Query is kept
   * in sync by the effect above instead of being stripped.
   */
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const session = params.get('session')?.trim();
    if (!session) return;
    const code = params.get('code')?.trim();

    let cancelled = false;

    void (async () => {
      await waitForGameSocket();
      if (cancelled) return;
      if (activeSessionIdRef.current === session) return;
      await joinLobbyById(session, code || undefined);
    })();

    return () => {
      cancelled = true;
    };
  }, [
    location.search,
    location.pathname,
    joinLobbyById,
    waitForGameSocket,
  ]);

  /** Join flow from `/lobbies` hub (`navigate(..., { state: { pendingJoinLobbyId } })`). */
  useEffect(() => {
    const joinId = (location.state as { pendingJoinLobbyId?: string } | null)
      ?.pendingJoinLobbyId;
    if (!joinId) return;

    let cancelled = false;

    void (async () => {
      try {
        await waitForGameSocket();
        if (cancelled) return;
        await joinLobbyById(joinId);
      } finally {
        if (!cancelled) {
          navigate(
            { pathname: location.pathname, search: location.search },
            { replace: true, state: {} },
          );
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [
    location.state,
    location.pathname,
    location.search,
    navigate,
    joinLobbyById,
    waitForGameSocket,
  ]);

  const handleSelectCell = (cellIndex: number) => {
    if (mp.state.mpPhase !== MpPhase.Playing) {
      if (mp.state.mpPhase === MpPhase.Lobby) {
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
