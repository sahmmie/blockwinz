/* eslint-disable react-refresh/only-export-components -- provider shares hook + types */
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Spinner, Text } from '@chakra-ui/react';
import { useSocketContext } from '@/context/socketContext';
import useWalletState from '@/hooks/useWalletState';
import { DEFAULT_ROUNDING_DECIMALS } from '@/shared/constants/app.constant';
import JoinLobbyConfirmModal, {
  type JoinLobbyConfirmPayload,
} from '@/casinoGames/multiplayer/JoinLobbyConfirmModal';
import RematchInviteModal from '@/casinoGames/multiplayer/RematchInviteModal';
import { isMultiplayerLobbyMock } from '@/casinoGames/multiplayer/isMultiplayerLobbyMock';
import {
  applyQuoridorMove,
  createInitialQuoridorState,
  validateQuoridorMove,
  type QuoridorGameState,
  type QuoridorMove,
} from '@blockwinz/quoridor-engine';
import { useMultiplayerQuoridor } from '@/casinoGames/quoridor/hooks/useMultiplayerQuoridor';
import type { QuoridorGameStatePayload } from '@/casinoGames/quoridor/hooks/useMultiplayerQuoridor';
import { MpPhase } from '@/casinoGames/tictactoes/types';
import { toaster } from '@/components/ui/toaster';
import { quoridorInvalidMoveToastCopy } from '@/casinoGames/quoridor/quoridorInvalidMoveCopy';
import { LobbyVisibility, MultiplayerGameTypeEnum } from '@blockwinz/shared';
import { multiplayerGamesInfo } from '@/shared/constants/multiplayerGamesInfo.constant';

const SOCKET_WAIT_MS = 15_000;

const QUORIDOR_JOIN_MODAL_TITLE =
  multiplayerGamesInfo[MultiplayerGameTypeEnum.QuoridorGame]?.name ?? 'Quoridor';

/** Second seat in UI until the server builds real Quoridor state (2 players seated). */
const LOBBY_OPPONENT_PLACEHOLDER_ID = 'lobby-waiting-opponent';

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

type MpReturn = ReturnType<typeof useMultiplayerQuoridor>;

function payloadToQuoridorState(
  p: QuoridorGameStatePayload,
): QuoridorGameState | null {
  const a = p.players?.[0];
  const b = p.players?.[1];
  if (!a || !b) return null;
  return {
    boardSize: 9,
    players: [a, b],
    walls: p.walls ?? [],
    currentTurnUserId: p.currentTurn ?? a.userId,
    winnerUserId: p.winnerId ?? undefined,
  };
}

export type QuoridorGameContextValue = {
  opponentLabel: string;
  displayGame: QuoridorGameState | null;
  state: MpReturn['state'] & { deepLinkJoinPending?: boolean };
  actions: MpReturn['actions'] & {
    submitQuoridorMoveWithRules: (move: QuoridorMove) => void;
  };
};

const QuoridorGameContext = createContext<QuoridorGameContextValue | undefined>(
  undefined,
);

export const QuoridorGameProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const mp = useMultiplayerQuoridor();
  const [hotseat, setHotseat] = useState<QuoridorGameState>(() =>
    createInitialQuoridorState('hotseat-south', 'hotseat-north', 'hotseat-south'),
  );
  const {
    joinLobbyById,
    syncActiveSession,
    resolveLobbyFromPublicList,
    clearInviteUrlParams,
    acceptRematchInvite,
    declineRematchInvite,
  } = mp.actions;
  const { getSocketInstance } = useSocketContext();
  const location = useLocation();
  const navigate = useNavigate();
  const { balances } = useWalletState();

  const [pendingInvite, setPendingInvite] =
    useState<JoinLobbyConfirmPayload | null>(null);
  const [deepLinkJoinCodeDraft, setDeepLinkJoinCodeDraft] = useState('');
  const [inviteLinkLoading, setInviteLinkLoading] = useState(false);
  const inviteDismissedSessionRef = useRef<string | null>(null);

  const activeSessionIdRef = useRef<string | null>(null);
  activeSessionIdRef.current = mp.state.activeGameId ?? null;

  const userIdRef = useRef(mp.state.userId);
  userIdRef.current = mp.state.userId;

  const currency = mp.state.currency;
  const roundingDecimals =
    balances.find((c) => c.currency === currency)?.decimals ??
    DEFAULT_ROUNDING_DECIMALS;

  const waitForGameSocket = useCallback(() => {
    return waitForSocketConnected(getSocketInstance, SOCKET_WAIT_MS);
  }, [getSocketInstance]);

  useEffect(() => {
    if (mp.state.mpPhase === MpPhase.Idle && !mp.state.activeGameId) {
      setHotseat(
        createInitialQuoridorState(
          'hotseat-south',
          'hotseat-north',
          'hotseat-south',
        ),
      );
    }
  }, [mp.state.mpPhase, mp.state.activeGameId]);

  const displayGame = useMemo((): QuoridorGameState | null => {
    const sid = mp.state.activeGameId;
    const q = mp.state.quoridorGame;
    const players = mp.state.multiplayerSession?.players ?? [];
    const soleSeat =
      players.length === 1 && players[0] ? String(players[0]) : null;
    const seatUid = mp.state.userId ?? soleSeat;

    if (sid && q) {
      return payloadToQuoridorState(q);
    }
    if (
      sid &&
      !q &&
      mp.state.mpPhase === MpPhase.Lobby &&
      seatUid
    ) {
      return createInitialQuoridorState(
        seatUid,
        LOBBY_OPPONENT_PLACEHOLDER_ID,
        seatUid,
      );
    }
    if (sid && !q && mp.state.mpPhase === MpPhase.Playing) {
      return null;
    }
    if (mp.state.mpPhase === MpPhase.Idle && !sid) {
      return hotseat;
    }
    if (q) {
      return payloadToQuoridorState(q);
    }
    return hotseat;
  }, [
    mp.state.activeGameId,
    mp.state.mpPhase,
    mp.state.quoridorGame,
    mp.state.userId,
    mp.state.multiplayerSession?.players,
    hotseat,
  ]);

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

  /** Close invite UI when the match ends (URL is also cleared from the game hook). */
  useEffect(() => {
    if (mp.state.mpPhase !== MpPhase.Ended) return;
    setPendingInvite(null);
    setDeepLinkJoinCodeDraft('');
  }, [mp.state.mpPhase]);

  /**
   * Deep link: `/multiplayer/quoridor?session=…&code=…` — after sync, skip modal if
   * already seated; otherwise open confirm (join code field only when the lobby is private).
   */
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const session = params.get('session')?.trim();
    if (!session) return;

    if (mp.state.mpPhase === MpPhase.Ended) {
      clearInviteUrlParams();
      return;
    }

    const codeFromUrl = params.get('code')?.trim();
    let cancelled = false;

    void (async () => {
      setInviteLinkLoading(true);
      try {
        await waitForGameSocket();
        if (cancelled) return;
        if (inviteDismissedSessionRef.current === session) return;

        const activeRow = await syncActiveSession();
        if (cancelled) return;
        const uid = userIdRef.current;
        if (
          activeRow?._id === session &&
          uid &&
          (activeRow.players ?? []).map(String).includes(String(uid))
        ) {
          return;
        }

        let listRow: Awaited<
          ReturnType<typeof resolveLobbyFromPublicList>
        > = null;
        try {
          listRow = await resolveLobbyFromPublicList(session);
        } catch {
          listRow = null;
        }
        if (cancelled) return;

        // Only private tables need a join code in the modal. Public tables are often
        // absent from LIST_PUBLIC_LOBBIES (full / timing); requiring a code blocked joins.
        const needsCodeInput =
          !codeFromUrl &&
          listRow?.visibility === LobbyVisibility.PRIVATE;

        setDeepLinkJoinCodeDraft('');
        setPendingInvite({
          kind: 'invite',
          sessionId: session,
          joinCode: codeFromUrl || undefined,
          source: 'url',
          requiresJoinCodeInput: needsCodeInput,
          tableBetAmount: listRow?.betAmount,
          tableCurrency: listRow?.currency,
        });
      } finally {
        if (!cancelled) {
          setInviteLinkLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
      setInviteLinkLoading(false);
    };
  }, [
    location.search,
    mp.state.mpPhase,
    syncActiveSession,
    resolveLobbyFromPublicList,
    waitForGameSocket,
    clearInviteUrlParams,
  ]);

  /** Hub: `navigate(..., { state: { pendingJoinLobbyId } })` — confirm before join. */
  useEffect(() => {
    const params = new URLSearchParams(
      location.search.startsWith('?')
        ? location.search.slice(1)
        : location.search,
    );
    if (params.get('session')?.trim()) return;

    const joinId = (
      location.state as { pendingJoinLobbyId?: string } | null
    )?.pendingJoinLobbyId?.trim();
    if (!joinId) return;

    if (mp.state.mpPhase === MpPhase.Ended) {
      return;
    }

    let cancelled = false;

    void (async () => {
      setInviteLinkLoading(true);
      try {
        await waitForGameSocket();
        if (cancelled) return;
        if (inviteDismissedSessionRef.current === joinId) return;

        const row = await syncActiveSession();
        if (cancelled) return;
        const uid = userIdRef.current;
        if (
          row?._id === joinId &&
          uid &&
          (row.players ?? []).map(String).includes(String(uid))
        ) {
          navigate(
            { pathname: location.pathname, search: location.search },
            { replace: true, state: {} },
          );
          return;
        }

        let listRow: Awaited<
          ReturnType<typeof resolveLobbyFromPublicList>
        > = null;
        try {
          listRow = await resolveLobbyFromPublicList(joinId);
        } catch {
          listRow = null;
        }
        if (cancelled) return;

        setPendingInvite({
          kind: 'invite',
          sessionId: joinId,
          source: 'hub',
          tableBetAmount: listRow?.betAmount,
          tableCurrency: listRow?.currency,
        });
        navigate(
          { pathname: location.pathname, search: location.search },
          { replace: true, state: {} },
        );
      } finally {
        if (!cancelled) {
          setInviteLinkLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
      setInviteLinkLoading(false);
    };
  }, [
    location.state,
    location.pathname,
    location.search,
    navigate,
    syncActiveSession,
    waitForGameSocket,
    resolveLobbyFromPublicList,
    mp.state.mpPhase,
  ]);

  const handleInviteModalClose = useCallback(() => {
    setDeepLinkJoinCodeDraft('');
    setPendingInvite((prev) => {
      if (prev?.kind === 'invite') {
        inviteDismissedSessionRef.current = prev.sessionId;
      }
      return null;
    });
    const p = new URLSearchParams(
      location.search.startsWith('?')
        ? location.search.slice(1)
        : location.search,
    );
    if (p.has('session') || p.has('code')) {
      p.delete('session');
      p.delete('code');
      const s = p.toString();
      navigate(
        {
          pathname: location.pathname,
          search: s ? `?${s}` : '',
        },
        { replace: true },
      );
    }
  }, [location.pathname, location.search, navigate]);

  const handleInviteConfirm = useCallback(async () => {
    if (pendingInvite?.kind !== 'invite') return;
    await waitForGameSocket();
    const joinCode =
      pendingInvite.source === 'url' &&
      pendingInvite.requiresJoinCodeInput &&
      !pendingInvite.joinCode?.trim()
        ? deepLinkJoinCodeDraft.trim() || undefined
        : pendingInvite.joinCode;
    const ok = await joinLobbyById(pendingInvite.sessionId, joinCode);
    if (ok) {
      inviteDismissedSessionRef.current = null;
      setDeepLinkJoinCodeDraft('');
      setPendingInvite(null);
    }
  }, [
    pendingInvite,
    deepLinkJoinCodeDraft,
    joinLobbyById,
    waitForGameSocket,
  ]);

  const submitQuoridorMoveWithRules = useCallback(
    (move: QuoridorMove) => {
      if (mp.state.mpPhase === MpPhase.Lobby) {
        toaster.create({
          title: 'Waiting for opponent',
          type: 'info',
        });
        return;
      }
      const sid = mp.state.activeGameId;
      const live = mp.state.quoridorGame;
      if (sid && live && mp.state.mpPhase === MpPhase.Playing) {
        const uid = mp.state.userId;
        if (!uid || String(live.currentTurn) !== String(uid)) {
          toaster.create({
            title: "Opponent's turn",
            type: 'info',
          });
          return;
        }
        void mp.actions.submitQuoridorMove(move);
        return;
      }
      if (mp.state.mpPhase !== MpPhase.Idle && mp.state.mpPhase !== MpPhase.Playing) {
        return;
      }
      const g = hotseat;
      const acting = g.currentTurnUserId;
      const v = validateQuoridorMove(g, acting, move);
      if (v !== true) {
        const { title, description } = quoridorInvalidMoveToastCopy(v);
        toaster.create({ title, description, type: 'error' });
        return;
      }
      const { nextState } = applyQuoridorMove(g, acting, move);
      setHotseat(nextState);
    },
    [mp.state, hotseat, mp.actions],
  );

  const value: QuoridorGameContextValue = {
    opponentLabel: 'Opponent',
    displayGame,
    state: { ...mp.state, deepLinkJoinPending: inviteLinkLoading },
    actions: {
      ...mp.actions,
      submitQuoridorMoveWithRules,
    },
  };

  return (
    <QuoridorGameContext.Provider value={value}>
      {inviteLinkLoading ? (
        <Box
          position='fixed'
          inset={0}
          zIndex='modal'
          bg='blackAlpha.700'
          display='flex'
          alignItems='center'
          justifyContent='center'
          flexDirection='column'
          gap={4}
          pointerEvents='all'>
          <Spinner size='xl' color='#00DD25' />
          <Text color='white' fontSize='sm' fontWeight='600' textAlign='center' px={6}>
            Loading table…
          </Text>
          <Text color='gray.400' fontSize='xs' textAlign='center' px={8} maxW='320px'>
            Connecting and fetching this lobby. You&apos;ll confirm join in a
            moment.
          </Text>
        </Box>
      ) : null}
      <JoinLobbyConfirmModal
        open={
          Boolean(pendingInvite) &&
          pendingInvite?.kind === 'invite'
        }
        onClose={handleInviteModalClose}
        payload={pendingInvite?.kind === 'invite' ? pendingInvite : null}
        gameTitle={QUORIDOR_JOIN_MODAL_TITLE}
        viewerCurrency={currency ?? ''}
        viewerStake={mp.state.betAmount ?? 0}
        roundingDecimals={roundingDecimals}
        isSubmitting={mp.state.isLoadingStart}
        onConfirmJoin={handleInviteConfirm}
        inviteJoinCodeDraft={deepLinkJoinCodeDraft}
        onInviteJoinCodeDraftChange={setDeepLinkJoinCodeDraft}
      />
      <RematchInviteModal
        open={
          Boolean(mp.state.rematchInvite) && !isMultiplayerLobbyMock()
        }
        completedSessionId={
          mp.state.rematchInvite?.completedSessionId ?? null
        }
        fromUserId={mp.state.rematchInvite?.fromUserId ?? null}
        isSubmitting={mp.state.rematchBusy ?? false}
        onAccept={() => void acceptRematchInvite()}
        onDecline={() => void declineRematchInvite()}
      />
      {children}
    </QuoridorGameContext.Provider>
  );
};

export const useQuoridorGameContext = (): QuoridorGameContextValue => {
  const context = useContext(QuoridorGameContext);
  if (!context) {
    throw new Error(
      'useQuoridorGameContext must be used within a QuoridorGameProvider',
    );
  }
  return context;
};
