import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSocketContext } from '@/context/socketContext';
import useAuth from '@/hooks/useAuth';
import { getUserIdFromAccessToken } from '@/shared/utils/jwtPayload';
import {
  DbGameSchema,
  GameGatewaySocketEvent,
  GameMode,
  LobbyVisibility,
  MultiplayerGameEmitterEvent,
  MultiplayerGamePayloadAction,
  MultiplayerSessionStatus,
  QuickMatchResponseStatus,
} from '@blockwinz/shared';
import { BOARD_SIZE, TOTAL_TILES } from '../constants';
import {
  BET_STATUS,
  IErrorMsg,
  MpPhase,
  RiskLevel,
  TictactoeState,
  TICTACTOE_TILE,
} from '../types';
import { parseFloatValue } from '@/shared/utils/common';
import useWalletState from '@/hooks/useWalletState';
import { useBetAmount } from '@/hooks/useBetAmount';
import { toaster } from '@/components/ui/toaster';
import useModal, { ModalProps } from '@/hooks/useModal';
import GameStatusModal from '../components/modals/GameStatusModal';
import type {
  CreateLobbyParams,
  HostInviteInfo,
  MultiplayerSessionRow,
} from '@/casinoGames/multiplayer/types';
import { MOCK_MULTIPLAYER_LOBBIES } from '@/casinoGames/multiplayer/multiplayerLobbyMock';
import { isMultiplayerLobbyMock } from '@/casinoGames/multiplayer/isMultiplayerLobbyMock';

export type { MultiplayerSessionRow } from '@/casinoGames/multiplayer/types';

type WsAck<T = unknown> = {
  success: boolean;
  data: T;
  message?: string;
  code?: number;
};

type GameStatePayload = {
  board?: Array<Array<string>>;
  players?: Array<{ userId: string; userIs: string; playerIsNext?: boolean }>;
  currentTurn?: string | null;
  betResultStatus?: string;
  winnerId?: string | null;
};

const GAME_TYPE = DbGameSchema.TicTacToeGame;

/** Max time to stay in quick-match queue before dequeue + UI reset (server has separate Redis key TTL). */
const QUICK_MATCH_WAIT_MS = 15_000;

const emptyCells = (): string[] => Array.from({ length: TOTAL_TILES }, () => '');

function emitAck<T>(
  emit: (
    event: string,
    data?: unknown,
    cb?: (r: WsAck<T>) => void,
  ) => void,
  event: string,
  data?: unknown,
): Promise<WsAck<T>> {
  return new Promise((resolve, reject) => {
    emit(event, data, (res: WsAck<T>) => {
      if (res?.success) resolve(res);
      else reject(new Error(res?.message ?? 'Request failed'));
    });
  });
}

function mapServerBetStatusToPlayer(
  status: string | undefined,
  winnerId: string | null | undefined,
  myId: string | null,
): BET_STATUS {
  if (!status) return BET_STATUS.NOT_STARTED;
  if (status === BET_STATUS.TIE) return BET_STATUS.TIE;
  if (status === BET_STATUS.IN_PROGRESS) return BET_STATUS.IN_PROGRESS;
  if (status === BET_STATUS.WIN && winnerId && myId) {
    return winnerId === myId ? BET_STATUS.WIN : BET_STATUS.LOSE;
  }
  return BET_STATUS.NOT_STARTED;
}

/**
 * Multiplayer Tic Tac Toe over the `game` Socket.IO namespace (sessions, matchmaking, moves).
 */
export function useMultiplayerTictactoe() {
  const navigate = useNavigate();
  const { pathname, search } = useLocation();
  const { emit, on, off, getSocketInstance } = useSocketContext();
  const token = useAuth((s) => s.token);
  const userId = getUserIdFromAccessToken(token);
  const { selectedBalance, balances, getWalletData } = useWalletState();
  const { openModal } = useModal();

  const [phase, setPhase] = useState<MpPhase>(MpPhase.Idle);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionRow, setSessionRow] = useState<MultiplayerSessionRow | null>(null);
  const [gameState, setGameState] = useState<GameStatePayload | null>(null);
  const [publicLobbies, setPublicLobbies] = useState<MultiplayerSessionRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [matchQueued, setMatchQueued] = useState(false);
  const [hostInvite, setHostInvite] = useState<HostInviteInfo | null>(null);
  const [quickMatchNoMatchOpen, setQuickMatchNoMatchOpen] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMsg, setErrorMsg] = useState<IErrorMsg>({
    title: '',
    description: '',
  });

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const quickMatchWaitTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  const clearQuickMatchWaitTimeout = useCallback(() => {
    if (quickMatchWaitTimeoutRef.current !== null) {
      clearTimeout(quickMatchWaitTimeoutRef.current);
      quickMatchWaitTimeoutRef.current = null;
    }
  }, []);

  const scheduleQuickMatchWaitTimeout = useCallback(() => {
    clearQuickMatchWaitTimeout();
    quickMatchWaitTimeoutRef.current = setTimeout(() => {
      quickMatchWaitTimeoutRef.current = null;
      void (async () => {
        try {
          await emitAck(emit, GameGatewaySocketEvent.CANCEL_QUICK_MATCH, {
            gameId: GAME_TYPE,
          });
        } catch {
          /* best-effort dequeue */
        }
        stopPolling();
        setMatchQueued(false);
        setPhase(MpPhase.Idle);
        setQuickMatchNoMatchOpen(true);
      })();
    }, QUICK_MATCH_WAIT_MS);
  }, [emit, clearQuickMatchWaitTimeout, stopPolling]);

  /** User dismissed Find match modal or left the queue early — does not open the “no match” modal. */
  const cancelQuickMatchSearch = useCallback(async () => {
    clearQuickMatchWaitTimeout();
    stopPolling();
    setIsLoading(false);
    try {
      await emitAck(emit, GameGatewaySocketEvent.CANCEL_QUICK_MATCH, {
        gameId: GAME_TYPE,
      });
    } catch {
      /* best-effort dequeue */
    }
    setMatchQueued(false);
    setPhase((p) => (p === MpPhase.Queued ? MpPhase.Idle : p));
  }, [emit, clearQuickMatchWaitTimeout, stopPolling]);

  const leaveSessionRoom = useCallback(
    (sid: string) => {
      emit(GameGatewaySocketEvent.LEAVE_SESSION_ROOM, { sessionId: sid });
    },
    [emit],
  );

  const joinSessionRoom = useCallback(
    async (sid: string) => {
      await emitAck(emit, GameGatewaySocketEvent.JOIN_SESSION_ROOM, {
        sessionId: sid,
      });
    },
    [emit],
  );

  const stripMultiplayerSearchParams = useCallback(() => {
    const p = new URLSearchParams(
      search.startsWith('?') ? search.slice(1) : search,
    );
    if (!p.has('session')) return;
    p.delete('session');
    p.delete('code');
    const s = p.toString();
    navigate(
      { pathname, search: s ? `?${s}` : '' },
      { replace: true },
    );
  }, [navigate, pathname, search]);

  const hydrateFromPayload = useCallback(
    (payload: {
      sessionId?: string;
      state?: GameStatePayload | null;
      gameState?: GameStatePayload;
      finalState?: GameStatePayload;
    }) => {
      const sid = payload.sessionId;
      if (sid) setSessionId(sid);
      const st =
        payload.state ?? payload.gameState ?? payload.finalState ?? null;
      if (st) setGameState(st);
    },
    [],
  );

  const applyGameStateToBoard = useCallback((gs: GameStatePayload) => {
    const b = gs.board;
    if (!b) return;
    const flat = b.flat().map((c) => c || '');
    setGameState(gs);
    return flat;
  }, []);

  const cellsFromGameState = useCallback((): string[] => {
    const b = gameState?.board;
    if (!b) return emptyCells();
    return b.flat().map((c) => c || '');
  }, [gameState]);

  const userSymbols = useCallback(() => {
    const gs = gameState;
    if (!gs?.players || !userId) {
      return {
        userIs: TICTACTOE_TILE.O,
        opponentIs: TICTACTOE_TILE.X,
      };
    }
    const me = gs.players.find((p) => p.userId === userId);
    const them = gs.players.find((p) => p.userId !== userId);
    return {
      userIs: me?.userIs ?? TICTACTOE_TILE.O,
      opponentIs: them?.userIs ?? TICTACTOE_TILE.X,
    };
  }, [gameState, userId]);

  const betResultStatus = useCallback((): BET_STATUS => {
    const gs = gameState;
    if (!gs) return BET_STATUS.NOT_STARTED;
    return mapServerBetStatusToPlayer(
      gs.betResultStatus,
      gs.winnerId ?? null,
      userId,
    );
  }, [gameState, userId]);

  const currentTurn = gameState?.currentTurn ?? TICTACTOE_TILE.O;

  const betAmount = sessionRow?.betAmount ?? 0;
  const currency = (sessionRow?.currency ??
    selectedBalance?.currency) as TictactoeState['currency'];
  const betAmountState = useBetAmount(betAmount ? String(betAmount) : '0');

  const [localBetAmount, setLocalBetAmount] = useState(0);
  const endedModalShownRef = useRef(false);

  const handleBetAmountChange = useCallback(
    (value: number) => {
      const dec =
        balances.find((c) => c.currency === currency)?.decimals ??
        selectedBalance?.decimals;
      setLocalBetAmount(parseFloatValue(value, dec));
    },
    [balances, currency, selectedBalance?.decimals],
  );

  const syncActiveSession = useCallback(async () => {
    try {
      const res = await emitAck<MultiplayerSessionRow | null>(
        emit,
        GameGatewaySocketEvent.GET_ACTIVE_GAME,
        {
          gameType: GAME_TYPE,
        },
      );
      const row = res.data as MultiplayerSessionRow & {
        gameState?: GameStatePayload;
      };
      if (!row || !row._id) {
        setSessionId(null);
        setSessionRow(null);
        setGameState(null);
        setPhase(MpPhase.Idle);
        return null;
      }
      setSessionId(row._id);
      setSessionRow(row);
      if (row.gameState) {
        setGameState(row.gameState);
        applyGameStateToBoard(row.gameState);
      }
      if (row.gameStatus === MultiplayerSessionStatus.PENDING) {
        setPhase(MpPhase.Lobby);
      } else if (row.gameStatus === MultiplayerSessionStatus.IN_PROGRESS) {
        setPhase(MpPhase.Playing);
      } else {
        setPhase(MpPhase.Ended);
      }
      await joinSessionRoom(row._id);
      return row;
    } catch {
      /* Socket not ready or transient error — do not clear session client-side */
      return null;
    }
  }, [emit, joinSessionRoom, applyGameStateToBoard]);

  const sessionIdRef = useRef<string | null>(null);
  useEffect(() => {
    sessionIdRef.current = sessionId;
  }, [sessionId]);

  const playersInSessionRef = useRef(0);
  useEffect(() => {
    playersInSessionRef.current = sessionRow?.players?.length ?? 0;
  }, [sessionRow?.players?.length, sessionRow?._id]);

  /**
   * Apply a session snapshot from the server (lobby list push, join broadcast, etc.).
   */
  const applyRemoteSessionRow = useCallback(
    (
      row: MultiplayerSessionRow & { gameState?: GameStatePayload },
      meta?: { reason?: string },
    ) => {
      const before = playersInSessionRef.current;
      const nextCount = row.players?.length ?? 0;

      setSessionId(row._id);
      setSessionRow(row);
      if (row.gameState) {
        setGameState(row.gameState);
        applyGameStateToBoard(row.gameState);
      }
      if (row.gameStatus === MultiplayerSessionStatus.PENDING) {
        setPhase(MpPhase.Lobby);
      } else if (row.gameStatus === MultiplayerSessionStatus.IN_PROGRESS) {
        setPhase(MpPhase.Playing);
      } else if (
        row.gameStatus === MultiplayerSessionStatus.COMPLETED ||
        row.gameStatus === MultiplayerSessionStatus.CANCELLED
      ) {
        setPhase(MpPhase.Ended);
      }

      playersInSessionRef.current = nextCount;

      if (
        meta?.reason === 'player_joined' &&
        userId &&
        row.hostUserId &&
        row.hostUserId === userId &&
        nextCount > before
      ) {
        toaster.create({
          title: 'Opponent joined',
          description: 'They are seated at your table.',
          type: 'success',
        });
      }
    },
    [applyGameStateToBoard, userId],
  );

  useEffect(() => {
    const socket = getSocketInstance();
    if (!socket) return;

    const onStarted = (payload: {
      sessionId: string;
      state?: GameStatePayload | null;
    }) => {
      hydrateFromPayload(payload);
      setPhase(MpPhase.Playing);
      setMatchQueued(false);
      stopPolling();
      if (payload.state) applyGameStateToBoard(payload.state);
      void syncActiveSession();
    };

    const onMove = (payload: {
      sessionId: string;
      gameState?: GameStatePayload;
    }) => {
      if (payload.gameState) applyGameStateToBoard(payload.gameState);
    };

    const onInvalid = (payload: { reason?: string }) => {
      toaster.create({
        title: 'Invalid move',
        description: payload.reason ?? 'Try again',
        type: 'error',
      });
    };

    const onFinished = (payload: {
      sessionId: string;
      winner?: string | null;
      finalState?: GameStatePayload;
    }) => {
      if (payload.finalState) applyGameStateToBoard(payload.finalState);
      setPhase(MpPhase.Ended);
      void getWalletData();
    };

    const onGameError = (payload: { message?: string }) => {
      toaster.create({
        title: 'Game',
        description: payload?.message ?? 'Something went wrong',
        type: 'error',
      });
    };

    const onGameJoined = (payload: {
      sessionId: string;
      session?: MultiplayerSessionRow & { gameState?: GameStatePayload };
    }) => {
      if (payload.sessionId !== sessionIdRef.current || !payload.session) return;
      applyRemoteSessionRow(payload.session);
    };

    on(MultiplayerGameEmitterEvent.GAME_STARTED, onStarted);
    on(MultiplayerGameEmitterEvent.GAME_MOVE, onMove);
    on(MultiplayerGameEmitterEvent.GAME_INVALID_MOVE, onInvalid);
    on(MultiplayerGameEmitterEvent.GAME_FINISHED, onFinished);
    on(MultiplayerGameEmitterEvent.GAME_JOINED, onGameJoined);
    on(GameGatewaySocketEvent.GAME_ERROR, onGameError);

    return () => {
      off(MultiplayerGameEmitterEvent.GAME_STARTED, onStarted);
      off(MultiplayerGameEmitterEvent.GAME_MOVE, onMove);
      off(MultiplayerGameEmitterEvent.GAME_INVALID_MOVE, onInvalid);
      off(MultiplayerGameEmitterEvent.GAME_FINISHED, onFinished);
      off(MultiplayerGameEmitterEvent.GAME_JOINED, onGameJoined);
      off(GameGatewaySocketEvent.GAME_ERROR, onGameError);
    };
  }, [
    on,
    off,
    getSocketInstance,
    hydrateFromPayload,
    applyGameStateToBoard,
    stopPolling,
    getWalletData,
    syncActiveSession,
    applyRemoteSessionRow,
  ]);

  /**
   * Restore pending / in-progress session after refresh. Waits for the game socket
   * (ref may be null on first paint; parent SocketProvider connects asynchronously).
   */
  useEffect(() => {
    if (!token || isMultiplayerLobbyMock()) return;

    let cancelled = false;
    let pollId: number | null = null;
    const cleanups: Array<() => void> = [];

    const run = () => {
      if (cancelled) return;
      void syncActiveSession();
    };

    const attach = (socket: NonNullable<ReturnType<typeof getSocketInstance>>) => {
      const onConnect = () => run();
      socket.on('connect', onConnect);
      cleanups.push(() => socket.off('connect', onConnect));
      if (socket.connected) run();
    };

    let attached = false;
    const tryAttach = () => {
      if (attached || cancelled) return false;
      const s = getSocketInstance();
      if (!s) return false;
      attached = true;
      attach(s);
      if (pollId != null) {
        clearInterval(pollId);
        pollId = null;
      }
      return true;
    };

    if (!tryAttach()) {
      pollId = window.setInterval(() => {
        tryAttach();
      }, 100);
      window.setTimeout(() => {
        if (pollId != null) {
          clearInterval(pollId);
          pollId = null;
        }
      }, 15000);
    }

    return () => {
      cancelled = true;
      if (pollId != null) clearInterval(pollId);
      cleanups.forEach((fn) => fn());
    };
  }, [token, getSocketInstance, syncActiveSession]);

  useEffect(() => {
    return () => clearQuickMatchWaitTimeout();
  }, [clearQuickMatchWaitTimeout]);

  useEffect(() => {
    if (sessionRow?.betAmount != null && sessionRow.betAmount > 0) {
      setLocalBetAmount(sessionRow.betAmount);
    }
  }, [sessionRow?._id, sessionRow?.betAmount]);

  const startQuickMatchPoll = useCallback(() => {
    stopPolling();
    pollRef.current = setInterval(() => {
      void (async () => {
        try {
          const res = await emitAck<MultiplayerSessionRow | null>(
            emit,
            GameGatewaySocketEvent.GET_ACTIVE_GAME,
            {
              gameType: GAME_TYPE,
            },
          );
          const row = res.data as MultiplayerSessionRow & {
            gameState?: GameStatePayload;
          };
          if (row?._id) {
            clearQuickMatchWaitTimeout();
            stopPolling();
            setMatchQueued(false);
            setSessionId(row._id);
            setSessionRow(row);
            if (row.gameState) {
              setGameState(row.gameState);
              applyGameStateToBoard(row.gameState);
            }
            if (row.gameStatus === MultiplayerSessionStatus.PENDING)
              setPhase(MpPhase.Lobby);
            else if (row.gameStatus === MultiplayerSessionStatus.IN_PROGRESS) {
              setPhase(MpPhase.Playing);
              if (row.gameState) applyGameStateToBoard(row.gameState);
            }
            await joinSessionRoom(row._id);
          }
        } catch {
          /* keep polling */
        }
      })();
    }, 2000);
  }, [
    emit,
    stopPolling,
    joinSessionRoom,
    applyGameStateToBoard,
    clearQuickMatchWaitTimeout,
  ]);

  const quickMatch = useCallback(
    async (betAmountMustEqual = true) => {
    if (isMultiplayerLobbyMock()) {
      toaster.create({
        title: 'Mock mode',
        description: 'Turn off VITE_MULTIPLAYER_LOBBY_MOCK to use live matchmaking.',
        type: 'info',
      });
      return;
    }
    if (!currency) {
      toaster.create({
        title: 'Wallet not ready',
        description: 'Select a currency, then try Find match again.',
        type: 'error',
      });
      return;
    }
    if (localBetAmount <= 0) {
      toaster.create({
        title: 'Set a stake first',
        description:
          'Enter a stake amount greater than zero above, then tap Find match.',
        type: 'error',
      });
      return;
    }
    if (
      phase === MpPhase.Lobby ||
      phase === MpPhase.Playing ||
      phase === MpPhase.Queued ||
      matchQueued
    ) {
      toaster.create({
        title: 'Already in a session',
        description:
          phase === MpPhase.Queued
            ? 'Cancel matchmaking or wait to be paired first.'
            : 'Finish or leave this game before finding another match.',
        type: 'info',
      });
      return;
    }
    setHasError(false);
    setQuickMatchNoMatchOpen(false);
    clearQuickMatchWaitTimeout();
    try {
      const res = await emitAck<{
        status: QuickMatchResponseStatus;
      }>(
        emit,
        GameGatewaySocketEvent.QUICK_MATCH,
        {
          gameId: GAME_TYPE,
          betAmount: localBetAmount,
          currency,
          betAmountMustEqual,
        },
      );
      if (res.data.status === QuickMatchResponseStatus.WAITING) {
        setPhase(MpPhase.Queued);
        setMatchQueued(true);
        startQuickMatchPoll();
        scheduleQuickMatchWaitTimeout();
      } else {
        setMatchQueued(false);
        stopPolling();
        await syncActiveSession();
      }
    } catch (e) {
      setHasError(true);
      setErrorMsg({
        title: 'Matchmaking failed',
        description: e instanceof Error ? e.message : 'Try again',
      });
    }
  },
  [
    currency,
    localBetAmount,
    emit,
    syncActiveSession,
    startQuickMatchPoll,
    stopPolling,
    clearQuickMatchWaitTimeout,
    scheduleQuickMatchWaitTimeout,
    phase,
    matchQueued,
  ],
  );

  /**
   * Creates a public or private lobby (`newGame`).
   */
  const createLobby = useCallback(
    async (params: CreateLobbyParams) => {
      if (isMultiplayerLobbyMock()) {
        toaster.create({
          title: 'Mock mode',
          description: 'Turn off VITE_MULTIPLAYER_LOBBY_MOCK to create a real lobby.',
          type: 'info',
        });
        return;
      }
      const stake = params.betAmount;
      const cur = params.currency;
      if (!cur || stake <= 0) {
        toaster.create({
          title: 'Invalid bet',
          description: 'Choose amount and currency',
          type: 'error',
        });
        return;
      }
      if (params.visibility === LobbyVisibility.PRIVATE) {
        const code = params.joinCode?.trim();
        if (!code) {
          toaster.create({
            title: 'Join code required',
            description: 'Generate or enter a code for a private lobby.',
            type: 'error',
          });
          return;
        }
      }
      if (
        phase === MpPhase.Lobby ||
        phase === MpPhase.Playing ||
        phase === MpPhase.Queued ||
        matchQueued
      ) {
        toaster.create({
          title: 'Already in a session',
          description:
            'Finish or leave this game before hosting another table.',
          type: 'info',
        });
        return;
      }
      setIsLoading(true);
      try {
        const res = await emitAck<MultiplayerSessionRow>(
          emit,
          GameGatewaySocketEvent.NEW_GAME,
          {
            gameType: GAME_TYPE,
            betAmount: stake,
            currency: cur,
            visibility: params.visibility,
            maxPlayers: params.maxPlayers ?? 2,
            joinCode:
              params.visibility === LobbyVisibility.PRIVATE
                ? params.joinCode?.trim()
                : undefined,
            betAmountMustEqual: params.betAmountMustEqual ?? false,
          },
        );
        const row = res.data as MultiplayerSessionRow & {
          gameState?: GameStatePayload;
        };
        setSessionId(row._id);
        setSessionRow(row);
        if (row.gameState) {
          setGameState(row.gameState);
          applyGameStateToBoard(row.gameState);
        }
        if (row.gameStatus === MultiplayerSessionStatus.IN_PROGRESS) {
          setPhase(MpPhase.Playing);
          setHostInvite(null);
        } else if (row.gameStatus === MultiplayerSessionStatus.PENDING) {
          setPhase(MpPhase.Lobby);
          setHostInvite({
            sessionId: row._id,
            visibility: params.visibility,
            plaintextJoinCode:
              params.visibility === LobbyVisibility.PRIVATE
                ? params.joinCode?.trim()
                : undefined,
            betAmount: stake,
            currency: cur,
          });
        } else {
          setPhase(MpPhase.Ended);
          setHostInvite(null);
        }
        await joinSessionRoom(row._id);
      } catch (e) {
        toaster.create({
          title: 'Could not create lobby',
          description: e instanceof Error ? e.message : 'Try again',
          type: 'error',
        });
      } finally {
        setIsLoading(false);
      }
    },
    [emit, joinSessionRoom, applyGameStateToBoard, phase, matchQueued],
  );

  const refreshPublicLobbies = useCallback(async () => {
    if (isMultiplayerLobbyMock()) {
      setPublicLobbies(MOCK_MULTIPLAYER_LOBBIES);
      return;
    }
    try {
      const res = await emitAck<MultiplayerSessionRow[]>(
        emit,
        GameGatewaySocketEvent.LIST_PUBLIC_LOBBIES,
        {
          gameType: GAME_TYPE,
        },
      );
      setPublicLobbies(Array.isArray(res.data) ? res.data : []);
    } catch {
      setPublicLobbies([]);
    }
  }, [emit]);

  /** Subscribe to lobby list updates for this game type (Browse tab + hub). */
  useEffect(() => {
    if (isMultiplayerLobbyMock()) return;

    const onLobbyUpdated = (payload: {
      gameType?: DbGameSchema | string;
      reason?: string;
      sessionId?: string;
      session?: MultiplayerSessionRow & { gameState?: GameStatePayload };
    }) => {
      void refreshPublicLobbies();
      if (
        payload.gameType != null &&
        payload.gameType !== GAME_TYPE
      ) {
        return;
      }
      const sid = payload.sessionId;
      const row = payload.session;
      if (!sid || !row || sid !== sessionIdRef.current) return;
      applyRemoteSessionRow(row, { reason: payload.reason });
    };
    const onLobbyExpired = () => {
      void refreshPublicLobbies();
    };

    on(MultiplayerGameEmitterEvent.LOBBY_UPDATED, onLobbyUpdated);
    on(MultiplayerGameEmitterEvent.LOBBY_EXPIRED, onLobbyExpired);

    void emitAck(emit, GameGatewaySocketEvent.JOIN_LOBBY_ROOM, {
      gameType: GAME_TYPE,
    }).catch(() => {
      /* socket may still be connecting */
    });

    return () => {
      off(MultiplayerGameEmitterEvent.LOBBY_UPDATED, onLobbyUpdated);
      off(MultiplayerGameEmitterEvent.LOBBY_EXPIRED, onLobbyExpired);
      void emitAck(emit, GameGatewaySocketEvent.LEAVE_LOBBY_ROOM, {
        gameType: GAME_TYPE,
      }).catch(() => {});
    };
  }, [emit, on, off, refreshPublicLobbies, applyRemoteSessionRow]);

  /** Quick match: server notifies this client when a pairing is ready. */
  useEffect(() => {
    if (isMultiplayerLobbyMock()) return;

    const onMatchReady = () => {
      clearQuickMatchWaitTimeout();
      stopPolling();
      setMatchQueued(false);
      void syncActiveSession();
    };
    on(MultiplayerGameEmitterEvent.MATCH_READY, onMatchReady);
    return () => {
      off(MultiplayerGameEmitterEvent.MATCH_READY, onMatchReady);
    };
  }, [on, off, syncActiveSession, stopPolling, clearQuickMatchWaitTimeout]);

  const joinLobbyById = useCallback(
    async (gameId: string, joinCode?: string) => {
      if (isMultiplayerLobbyMock()) {
        toaster.create({
          title: 'Mock mode',
          description: 'Turn off VITE_MULTIPLAYER_LOBBY_MOCK to join a real lobby.',
          type: 'info',
        });
        return;
      }
      setIsLoading(true);
      try {
        const res = await emitAck<MultiplayerSessionRow>(
          emit,
          GameGatewaySocketEvent.JOIN_GAME,
          {
            gameId,
            joinCode,
          },
        );
        const row = res.data;
        setSessionId(row._id);
        setSessionRow(row);
        if (row.gameStatus === MultiplayerSessionStatus.PENDING)
          setPhase(MpPhase.Lobby);
        else setPhase(MpPhase.Playing);
        await joinSessionRoom(row._id);
        await syncActiveSession();
        const cur = row.currency.toUpperCase();
        const waiting =
          row.gameStatus === MultiplayerSessionStatus.PENDING;
        toaster.create({
          title: "You're in the game",
          description: waiting
            ? `Table stake ${row.betAmount} ${cur}. Wait for the host or another player — the match starts when everyone is ready.`
            : `Table stake ${row.betAmount} ${cur}. You're seated — make your moves on the board.`,
          type: 'success',
        });
      } catch (e) {
        toaster.create({
          title: 'Could not join',
          description: e instanceof Error ? e.message : 'Try again',
          type: 'error',
        });
      } finally {
        setIsLoading(false);
      }
    },
    [emit, joinSessionRoom, syncActiveSession],
  );

  const leavePendingLobby = useCallback(async () => {
    if (!sessionId) return;
    try {
      await emitAck(emit, GameGatewaySocketEvent.LEAVE_GAME, {
        gameId: sessionId,
      });
      leaveSessionRoom(sessionId);
    } catch {
      /* ignore */
    }
    setSessionId(null);
    setSessionRow(null);
    setGameState(null);
    setPhase(MpPhase.Idle);
    stopPolling();
    setMatchQueued(false);
    setHostInvite(null);
    stripMultiplayerSearchParams();
  }, [emit, sessionId, leaveSessionRoom, stopPolling, stripMultiplayerSearchParams]);

  const dismissHostInvite = useCallback(() => {
    setHostInvite(null);
  }, []);

  const sendMove = useCallback(
    async (cellIndex: number) => {
      if (!sessionId || !userId) return;
      const row = Math.floor(cellIndex / BOARD_SIZE);
      const col = cellIndex % BOARD_SIZE;
      const message = JSON.stringify({
        action: MultiplayerGamePayloadAction.MOVE,
        sessionId,
        move: { row, col },
      });
      try {
        await emitAck(emit, GameGatewaySocketEvent.GAME_ACTION, { message });
      } catch (e) {
        toaster.create({
          title: 'Move failed',
          description: e instanceof Error ? e.message : 'Try again',
          type: 'error',
        });
      }
    },
    [emit, sessionId, userId],
  );

  const resetMultiplayer = useCallback(() => {
    if (sessionId) leaveSessionRoom(sessionId);
    stopPolling();
    setSessionId(null);
    setSessionRow(null);
    setGameState(null);
    setPhase(MpPhase.Idle);
    setMatchQueued(false);
    setHostInvite(null);
    stripMultiplayerSearchParams();
  }, [sessionId, leaveSessionRoom, stopPolling, stripMultiplayerSearchParams]);

  const { userIs, opponentIs } = userSymbols();
  const cells = cellsFromGameState();
  const status = betResultStatus();

  const isActiveGame = useCallback(
    () => phase === MpPhase.Playing,
    [phase],
  );

  const hasEnded = useCallback(() => phase === MpPhase.Ended, [phase]);

  useEffect(() => {
    if (!hasError) return;
    toaster.create({
      title: errorMsg.title,
      description: errorMsg.description,
      type: 'error',
    });
    const t = setTimeout(() => setHasError(false), 3000);
    return () => clearTimeout(t);
  }, [hasError, errorMsg]);

  useEffect(() => {
    if (phase !== MpPhase.Ended) {
      endedModalShownRef.current = false;
    }
  }, [phase]);

  useEffect(() => {
    if (
      phase !== MpPhase.Ended ||
      endedModalShownRef.current ||
      status === BET_STATUS.IN_PROGRESS ||
      status === BET_STATUS.NOT_STARTED
    ) {
      return;
    }
    endedModalShownRef.current = true;
    const activeCurrencyInfo =
      balances.find((c) => c.currency === currency) || selectedBalance;
    const props = {
      multiplier: RiskLevel.MEDIUM,
      winAmount:
        status === BET_STATUS.WIN ? betAmount * parseFloatValue(RiskLevel.MEDIUM) : 0,
      betResultStatus: status,
      currency: activeCurrencyInfo,
    };
    const modalConfig: ModalProps = {
      size: 'xs',
      hideCloseButton: true,
      hideHeader: true,
      width: '200px',
      backgroundColor: '#00DD25',
      autoCloseAfter: 0,
      top: { base: '0', md: '-8%' },
      left: { base: '0', md: 20 },
      closeOnInteractInside: true,
      backdrop: true,
    };
    if (status === BET_STATUS.WIN) {
      openModal(GameStatusModal(props), 'Win!', modalConfig);
    }
    if (status === BET_STATUS.LOSE) {
      openModal(GameStatusModal(props), 'Lost!', {
        ...modalConfig,
        backgroundColor: '#545463',
      });
    }
    if (status === BET_STATUS.TIE) {
      openModal(GameStatusModal(props), 'Tie!', {
        ...modalConfig,
        backgroundColor: '#545463',
      });
    }
  }, [phase, status, betAmount, currency, balances, selectedBalance, openModal]);

  const profitOnWin = localBetAmount * parseFloatValue(RiskLevel.MEDIUM);

  const mappedState: TictactoeState = {
    multiplier: RiskLevel.MEDIUM,
    betAmount: localBetAmount,
    profitOnWin,
    mode: GameMode.Manual,
    animSpeed: 500,
    activeAutoBet: false,
    isLoading,
    hasError,
    errorMsg,
    activeGameId: sessionId,
    currency: (currency ?? selectedBalance?.currency)!,
    betAmountErrors: betAmountState.betAmountErrors,
    maxProfitErrors: {},
    modalIsOpen: false,
    cells,
    betResultStatus: status,
    userIs,
    aiIs: opponentIs,
    currentTurn,
    tokenHash: '',
    isTurboMode: false,
    isAnimating: false,
    mpPhase: phase,
    matchQueued,
    publicLobbies,
    turnDeadlineAt: sessionRow?.turnDeadlineAt ?? null,
    reconnectGraceUntil: sessionRow?.reconnectGraceUntil ?? null,
    userId,
    hostInvite,
    quickMatchNoMatchOpen,
    multiplayerSession: sessionRow,
  };

  return {
    state: {
      ...mappedState,
      isLoadingStart: isLoading,
      isActiveGame,
      hasEnded,
    },
    actions: {
      quickMatch,
      createLobby,
      refreshPublicLobbies,
      joinLobbyById,
      leavePendingLobby,
      sendMove,
      resetMultiplayer,
      handleBetAmountChange,
      syncActiveSession,
      dismissHostInvite,
      dismissQuickMatchNoMatch: () => setQuickMatchNoMatchOpen(false),
      cancelQuickMatchSearch,
    },
  };
}
