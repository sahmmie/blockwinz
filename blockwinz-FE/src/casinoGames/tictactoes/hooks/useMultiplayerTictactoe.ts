import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import { resolveMultiplayerJoinError } from '@/casinoGames/multiplayer/multiplayerJoinErrors';
import { WsAckError } from '@/casinoGames/multiplayer/wsAckError';
import { useTictactoeMultiplayerSound } from './useTictactoeMultiplayerSound';
import {
  boardFull,
  lineWinner,
  userIdForSymbol,
} from '../utils/boardOutcome';

export type { MultiplayerSessionRow } from '@/casinoGames/multiplayer/types';

type WsAck<T = unknown> = {
  success: boolean;
  data: T;
  message?: string;
  code?: number;
};

type RematchIntentAck =
  | { status: 'waiting' }
  | { status: 'noop' }
  | { status: 'matched'; session: MultiplayerSessionRow };

type GameStatePayload = {
  board?: Array<Array<string>>;
  players?: Array<{ userId: string; userIs: string; playerIsNext?: boolean }>;
  currentTurn?: string | null;
  betResultStatus?: string;
  winnerId?: string | null;
};

type GameActionAckData = {
  ok?: boolean;
  finished?: boolean;
  state?: unknown;
};

function isServerTerminalBetStatus(s: string | undefined): boolean {
  return s === BET_STATUS.WIN || s === BET_STATUS.TIE;
}

/** Map orchestrator `submitMove` state to the shape the board reads. */
function ackStateToGameStatePayload(raw: unknown): GameStatePayload | null {
  if (!raw || typeof raw !== 'object') return null;
  const s = raw as Record<string, unknown>;
  const board = s.board;
  if (!Array.isArray(board) || board.length === 0) return null;
  const normalizedBoard = board.map((row) =>
    Array.isArray(row) ? row.map((c) => String(c ?? '')) : [],
  );
  const players = Array.isArray(s.players)
    ? (s.players as Record<string, unknown>[]).map((p) => ({
        userId: String(p.userId ?? ''),
        userIs: String(p.userIs ?? ''),
        playerIsNext: Boolean(p.playerIsNext),
      }))
    : undefined;
  return {
    board: normalizedBoard,
    players,
    currentTurn:
      s.currentTurn === null || s.currentTurn === undefined
        ? null
        : String(s.currentTurn),
    betResultStatus:
      s.betResultStatus != null ? String(s.betResultStatus) : undefined,
    winnerId:
      s.winnerId === null || s.winnerId === undefined
        ? null
        : String(s.winnerId),
  };
}

/** Instant UI while the socket round-trip runs; superseded by ACK or GAME_MOVE. */
function optimisticLocalMove(
  gs: GameStatePayload,
  cellIndex: number,
  uid: string,
): GameStatePayload | null {
  const b = gs.board;
  if (!b || !gs.players?.length) return null;
  const row = Math.floor(cellIndex / BOARD_SIZE);
  const col = cellIndex % BOARD_SIZE;
  if (b[row]?.[col]) return null;
  const me = gs.players.find((p) => String(p.userId) === String(uid));
  if (!me || gs.currentTurn !== me.userIs) return null;
  const board = b.map((r) => [...r]);
  board[row][col] = me.userIs;
  const sym = me.userIs === 'X' || me.userIs === 'O' ? me.userIs : null;
  const winSym = sym ? lineWinner(board) : null;
  if (winSym) {
    const winnerId = userIdForSymbol(
      gs.players.map((p) => ({
        userId: String(p.userId),
        userIs: String(p.userIs),
      })),
      winSym,
    );
    return {
      ...gs,
      board,
      currentTurn: null,
      betResultStatus: BET_STATUS.WIN,
      winnerId: winnerId ?? null,
      players: gs.players.map((p) => ({
        ...p,
        playerIsNext: false,
      })),
    };
  }
  if (boardFull(board)) {
    return {
      ...gs,
      board,
      currentTurn: null,
      betResultStatus: BET_STATUS.TIE,
      winnerId: null,
      players: gs.players.map((p) => ({
        ...p,
        playerIsNext: false,
      })),
    };
  }
  const nextSym = me.userIs === 'X' ? 'O' : 'X';
  return {
    ...gs,
    board,
    currentTurn: nextSym,
    players: gs.players.map((p) => ({
      ...p,
      playerIsNext: p.userIs === nextSym,
    })),
  };
}

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
      else
        reject(
          new WsAckError(res?.message ?? 'Request failed', res?.code),
        );
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
    return String(winnerId) === String(myId) ? BET_STATUS.WIN : BET_STATUS.LOSE;
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
  const { playOwnMove, playOpponentMove, playWin } =
    useTictactoeMultiplayerSound();
  const { selectedBalance, balances, getWalletData, setSuppressWalletAutoRefreshDuringMpPlay } =
    useWalletState();
  const { openModal, closeModal } = useModal();

  const [phase, setPhase] = useState<MpPhase>(MpPhase.Idle);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionRow, setSessionRow] = useState<MultiplayerSessionRow | null>(null);
  const sessionIdRef = useRef<string | null>(null);
  const assignSessionId = useCallback((id: string | null) => {
    sessionIdRef.current = id;
    setSessionId(id);
  }, []);
  const [gameState, setGameState] = useState<GameStatePayload | null>(null);
  const [publicLobbies, setPublicLobbies] = useState<MultiplayerSessionRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [matchQueued, setMatchQueued] = useState(false);
  const [hostInvite, setHostInvite] = useState<HostInviteInfo | null>(null);
  /** Closing "Your game is ready" only hides the modal; invite data stays for Share room details. */
  const [hostInviteModalDismissed, setHostInviteModalDismissed] =
    useState(false);
  const [leaveLobbyPending, setLeaveLobbyPending] = useState(false);
  const [quickMatchNoMatchOpen, setQuickMatchNoMatchOpen] = useState(false);
  const [rematchInvite, setRematchInvite] = useState<{
    completedSessionId: string;
    fromUserId: string;
  } | null>(null);
  const [rematchBusy, setRematchBusy] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMsg, setErrorMsg] = useState<IErrorMsg>({
    title: '',
    description: '',
  });

  const gameStateRef = useRef<GameStatePayload | null>(null);
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

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

  const clearLocalMultiplayerTable = useCallback(
    (
      sid: string,
      toastInfo?: { title: string; description: string },
    ) => {
      leaveSessionRoom(sid);
      assignSessionId(null);
      setSessionRow(null);
      setGameState(null);
      setPhase(MpPhase.Idle);
      stopPolling();
      setMatchQueued(false);
      setHostInvite(null);
      setHostInviteModalDismissed(false);
      setRematchInvite(null);
      stripMultiplayerSearchParams();
      if (toastInfo) {
        toaster.create({
          title: toastInfo.title,
          description: toastInfo.description,
          type: 'info',
        });
      }
    },
    [
      leaveSessionRoom,
      assignSessionId,
      stopPolling,
      stripMultiplayerSearchParams,
    ],
  );

  const hydrateFromPayload = useCallback(
    (payload: {
      sessionId?: string;
      state?: GameStatePayload | null;
      gameState?: GameStatePayload;
      finalState?: GameStatePayload;
    }) => {
      const sid = payload.sessionId;
      if (sid) assignSessionId(sid);
      const st =
        payload.state ?? payload.gameState ?? payload.finalState ?? null;
      if (st) setGameState(st);
    },
    [assignSessionId],
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

  const betAmount = sessionRow?.betAmount ?? 0;
  const currency = (sessionRow?.currency ??
    selectedBalance?.currency) as TictactoeState['currency'];
  const betAmountState = useBetAmount(betAmount ? String(betAmount) : '0');

  const [localBetAmount, setLocalBetAmount] = useState(0);
  const endedModalShownRef = useRef(false);
  const prevShowEndedOutcomeRef = useRef(false);

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
        assignSessionId(null);
        setSessionRow(null);
        setGameState(null);
        setPhase(MpPhase.Idle);
        return null;
      }
      assignSessionId(row._id);
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
  }, [emit, joinSessionRoom, applyGameStateToBoard, assignSessionId]);

  const requestRematch = useCallback(async () => {
    if (isMultiplayerLobbyMock()) {
      toaster.create({
        title: 'Mock mode',
        description: 'Turn off VITE_MULTIPLAYER_LOBBY_MOCK for real rematch.',
        type: 'info',
      });
      return;
    }
    const matchOverUi =
      phase === MpPhase.Ended ||
      isServerTerminalBetStatus(gameState?.betResultStatus);
    if (!sessionRow?._id || !matchOverUi) return;
    const completedId = sessionRow._id;
    setRematchBusy(true);
    try {
      const res = await emitAck<RematchIntentAck>(
        emit,
        GameGatewaySocketEvent.REMATCH_REQUEST,
        { completedSessionId: completedId },
      );
      const d = res.data;
      if (d.status === 'waiting') {
        toaster.create({
          title: 'Rematch requested',
          description: 'Waiting for your opponent to accept or rematch.',
          type: 'success',
        });
      } else if (d.status === 'matched') {
        void leaveSessionRoom(completedId);
        await syncActiveSession();
        void getWalletData();
        toaster.create({
          title: 'Rematch starting',
          description: 'A new match is loading.',
          type: 'success',
        });
      } else if (d.status === 'noop') {
        toaster.create({
          title: 'Rematch',
          description: 'Request already sent.',
          type: 'info',
        });
      }
    } catch (e) {
      toaster.create({
        title: 'Rematch failed',
        description: e instanceof Error ? e.message : 'Try again',
        type: 'error',
      });
    } finally {
      setRematchBusy(false);
    }
  }, [
    emit,
    sessionRow?._id,
    phase,
    gameState?.betResultStatus,
    leaveSessionRoom,
    syncActiveSession,
    getWalletData,
  ]);

  const acceptRematchInvite = useCallback(async () => {
    if (isMultiplayerLobbyMock() || !rematchInvite) return;
    const { completedSessionId } = rematchInvite;
    setRematchBusy(true);
    try {
      const res = await emitAck<RematchIntentAck>(
        emit,
        GameGatewaySocketEvent.REMATCH_ACCEPT,
        { completedSessionId },
      );
      const d = res.data;
      setRematchInvite(null);
      if (d.status === 'matched') {
        void leaveSessionRoom(completedSessionId);
        await syncActiveSession();
        void getWalletData();
        toaster.create({
          title: 'Rematch starting',
          description: 'A new match is loading.',
          type: 'success',
        });
      } else if (d.status === 'waiting') {
        toaster.create({
          title: 'Rematch',
          description: 'Waiting for the other player.',
          type: 'info',
        });
      } else if (d.status === 'noop') {
        toaster.create({
          title: 'Rematch',
          description: 'Nothing to accept.',
          type: 'info',
        });
      }
    } catch (e) {
      toaster.create({
        title: 'Accept failed',
        description: e instanceof Error ? e.message : 'Try again',
        type: 'error',
      });
    } finally {
      setRematchBusy(false);
    }
  }, [
    emit,
    rematchInvite,
    leaveSessionRoom,
    syncActiveSession,
    getWalletData,
  ]);

  const declineRematchInvite = useCallback(async () => {
    if (!rematchInvite) return;
    const { completedSessionId } = rematchInvite;
    setRematchInvite(null);
    if (isMultiplayerLobbyMock()) return;
    setRematchBusy(true);
    try {
      await emitAck(emit, GameGatewaySocketEvent.REMATCH_DECLINE, {
        completedSessionId,
      });
    } catch {
      /* best-effort */
    } finally {
      setRematchBusy(false);
    }
  }, [emit, rematchInvite]);

  const cancelRematchIntent = useCallback(async () => {
    if (!sessionRow?._id || isMultiplayerLobbyMock()) return;
    try {
      await emitAck(emit, GameGatewaySocketEvent.REMATCH_CANCEL, {
        completedSessionId: sessionRow._id,
      });
    } catch {
      /* best-effort */
    }
  }, [emit, sessionRow?._id]);

  const playersInSessionRef = useRef(0);
  useEffect(() => {
    playersInSessionRef.current = sessionRow?.players?.length ?? 0;
  }, [sessionRow?.players?.length, sessionRow?._id]);

  /** Pause global wallet polling during live play; `GAME_FINISHED` calls `getWalletData()` explicitly. */
  useEffect(() => {
    const suppress = phase === MpPhase.Playing;
    setSuppressWalletAutoRefreshDuringMpPlay(suppress);
    return () => setSuppressWalletAutoRefreshDuringMpPlay(false);
  }, [phase, setSuppressWalletAutoRefreshDuringMpPlay]);

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

      assignSessionId(row._id);
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
    [applyGameStateToBoard, assignSessionId, userId],
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
      playerId?: string;
      gameState?: GameStatePayload;
    }) => {
      if (payload.gameState) applyGameStateToBoard(payload.gameState);
      if (
        payload.sessionId === sessionIdRef.current &&
        payload.playerId != null &&
        userId &&
        String(payload.playerId) !== String(userId)
      ) {
        playOpponentMove();
      }
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
      if (
        payload.sessionId === sessionIdRef.current &&
        payload.winner != null &&
        userId &&
        String(payload.winner) === String(userId)
      ) {
        playWin();
      }
      setPhase(MpPhase.Ended);
      stripMultiplayerSearchParams();
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
    stripMultiplayerSearchParams,
    playOpponentMove,
    playWin,
    userId,
  ]);

  useEffect(() => {
    if (isMultiplayerLobbyMock()) return;
    const socket = getSocketInstance();
    if (!socket) return;

    const onInvited = (payload: {
      completedSessionId?: string;
      fromUserId?: string;
    }) => {
      if (
        !payload.completedSessionId ||
        !payload.fromUserId ||
        !userId ||
        String(payload.fromUserId) === String(userId)
      ) {
        return;
      }
      setRematchInvite({
        completedSessionId: payload.completedSessionId,
        fromUserId: String(payload.fromUserId),
      });
    };

    const onDeclined = (payload: { completedSessionId?: string }) => {
      if (
        payload.completedSessionId &&
        sessionIdRef.current === payload.completedSessionId
      ) {
        toaster.create({
          title: 'Rematch declined',
          description: 'Your opponent declined a rematch.',
          type: 'info',
        });
      }
      setRematchInvite(null);
    };

    const onWithdrawn = (payload: { completedSessionId?: string }) => {
      if (
        payload.completedSessionId &&
        sessionIdRef.current === payload.completedSessionId
      ) {
        toaster.create({
          title: 'Rematch withdrawn',
          description: 'Your opponent cancelled the rematch request.',
          type: 'info',
        });
      }
      setRematchInvite(null);
    };

    on(MultiplayerGameEmitterEvent.REMATCH_INVITED, onInvited);
    on(MultiplayerGameEmitterEvent.REMATCH_DECLINED, onDeclined);
    on(MultiplayerGameEmitterEvent.REMATCH_WITHDRAWN, onWithdrawn);

    return () => {
      off(MultiplayerGameEmitterEvent.REMATCH_INVITED, onInvited);
      off(MultiplayerGameEmitterEvent.REMATCH_DECLINED, onDeclined);
      off(MultiplayerGameEmitterEvent.REMATCH_WITHDRAWN, onWithdrawn);
    };
  }, [on, off, getSocketInstance, userId]);

  useEffect(() => {
    if (phase === MpPhase.Playing || phase === MpPhase.Lobby) {
      setRematchInvite(null);
    }
  }, [phase]);

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
            assignSessionId(row._id);
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
    assignSessionId,
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
        assignSessionId(row._id);
        setSessionRow(row);
        if (row.gameState) {
          setGameState(row.gameState);
          applyGameStateToBoard(row.gameState);
        }
        if (row.gameStatus === MultiplayerSessionStatus.IN_PROGRESS) {
          setPhase(MpPhase.Playing);
          setHostInvite(null);
          setHostInviteModalDismissed(false);
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
          setHostInviteModalDismissed(false);
        } else {
          setPhase(MpPhase.Ended);
          setHostInvite(null);
          setHostInviteModalDismissed(false);
        }
        await joinSessionRoom(row._id);
        if (
          row.gameStatus === MultiplayerSessionStatus.PENDING ||
          row.gameStatus === MultiplayerSessionStatus.IN_PROGRESS
        ) {
          await syncActiveSession();
        }
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
    [
      emit,
      joinSessionRoom,
      applyGameStateToBoard,
      phase,
      matchQueued,
      assignSessionId,
      syncActiveSession,
    ],
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

  /** Snapshot lookup for deep-link UI (private vs public, join code field). */
  const resolveLobbyFromPublicList = useCallback(
    async (sessionId: string): Promise<MultiplayerSessionRow | null> => {
      if (isMultiplayerLobbyMock()) {
        return (
          MOCK_MULTIPLAYER_LOBBIES.find((l) => l._id === sessionId) ?? null
        );
      }
      try {
        const res = await emitAck<MultiplayerSessionRow[]>(
          emit,
          GameGatewaySocketEvent.LIST_PUBLIC_LOBBIES,
          {
            gameType: GAME_TYPE,
          },
        );
        const list = Array.isArray(res.data) ? res.data : [];
        return list.find((l) => l._id === sessionId) ?? null;
      } catch {
        return null;
      }
    },
    [emit],
  );

  /** Subscribe to lobby list updates for this game type (Browse tab + hub). */
  useEffect(() => {
    if (isMultiplayerLobbyMock()) return;

    const onLobbyUpdated = (payload: {
      gameType?: DbGameSchema | string;
      reason?: string;
      sessionId?: string;
      session?: MultiplayerSessionRow & { gameState?: GameStatePayload } | null;
    }) => {
      void refreshPublicLobbies();
      if (
        payload.gameType != null &&
        payload.gameType !== GAME_TYPE
      ) {
        return;
      }
      const sid = payload.sessionId;
      if (!sid || sid !== sessionIdRef.current) return;

      if (payload.session == null) {
        const r = payload.reason;
        let description = 'This table is no longer available.';
        if (r === 'host_left') description = 'The host left the table.';
        else if (r === 'lobby_closed')
          description = 'The last player left the table.';
        else if (r === 'lobby_expired')
          description = 'This lobby was closed or timed out.';
        clearLocalMultiplayerTable(sid, {
          title: 'Lobby closed',
          description,
        });
        return;
      }

      applyRemoteSessionRow(payload.session, { reason: payload.reason });
    };
    const onLobbyExpired = (payload: {
      sessionId?: string;
      gameType?: DbGameSchema | string;
    }) => {
      void refreshPublicLobbies();
      const sid = payload.sessionId;
      if (!sid || payload.gameType !== GAME_TYPE) return;
      if (sid !== sessionIdRef.current) return;
      clearLocalMultiplayerTable(sid, {
        title: 'Lobby closed',
        description: 'This lobby timed out or was closed by the server.',
      });
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
  }, [
    emit,
    on,
    off,
    refreshPublicLobbies,
    applyRemoteSessionRow,
    clearLocalMultiplayerTable,
  ]);

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
        return false;
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
        assignSessionId(row._id);
        setSessionRow(row);
        if (row.gameStatus === MultiplayerSessionStatus.PENDING) {
          setPhase(MpPhase.Lobby);
        } else if (row.gameStatus === MultiplayerSessionStatus.IN_PROGRESS) {
          setPhase(MpPhase.Playing);
        } else {
          setPhase(MpPhase.Ended);
        }
        await joinSessionRoom(row._id);
        // `getActiveGame` only returns pending / in_progress; syncing after a terminal session would clear state.
        if (
          row.gameStatus === MultiplayerSessionStatus.PENDING ||
          row.gameStatus === MultiplayerSessionStatus.IN_PROGRESS
        ) {
          await syncActiveSession();
        }
        const cur = row.currency.toUpperCase();
        const waiting =
          row.gameStatus === MultiplayerSessionStatus.PENDING;
        const ended =
          row.gameStatus === MultiplayerSessionStatus.COMPLETED ||
          row.gameStatus === MultiplayerSessionStatus.CANCELLED;
        if (ended) {
          toaster.create({
            title: 'Match finished',
            description: 'This table is no longer active.',
            type: 'info',
          });
        } else {
          toaster.create({
            title: "You're in the game",
            description: waiting
              ? `Table stake ${row.betAmount} ${cur}. Wait for the host or another player — the match starts when everyone is ready.`
              : `Table stake ${row.betAmount} ${cur}. You're seated — make your moves on the board.`,
            type: 'success',
          });
        }
        return true;
      } catch (e) {
        const code = e instanceof WsAckError ? e.code : undefined;
        const msg = e instanceof Error ? e.message : String(e);
        const resolved = resolveMultiplayerJoinError(code, msg);
        if (resolved.clearInviteUrl) {
          stripMultiplayerSearchParams();
        }
        toaster.create({
          title: resolved.title,
          description: resolved.description,
          type: 'error',
        });
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [
      emit,
      joinSessionRoom,
      syncActiveSession,
      stripMultiplayerSearchParams,
      assignSessionId,
    ],
  );

  const leavePendingLobby = useCallback(async () => {
    if (!sessionId) return;
    const sid = sessionId;
    setLeaveLobbyPending(true);
    try {
      await emitAck(emit, GameGatewaySocketEvent.LEAVE_GAME, {
        gameId: sid,
      });
      leaveSessionRoom(sid);
      assignSessionId(null);
      setSessionRow(null);
      setGameState(null);
      setPhase(MpPhase.Idle);
      stopPolling();
      setMatchQueued(false);
      setHostInvite(null);
      setHostInviteModalDismissed(false);
      stripMultiplayerSearchParams();
      toaster.create({
        title: 'Left lobby',
        description: 'You can host or join another table anytime.',
        type: 'success',
      });
    } catch {
      toaster.create({
        title: 'Could not leave',
        description: 'Try again in a moment.',
        type: 'error',
      });
    } finally {
      setLeaveLobbyPending(false);
    }
  }, [
    emit,
    sessionId,
    leaveSessionRoom,
    assignSessionId,
    stopPolling,
    stripMultiplayerSearchParams,
  ]);

  const dismissHostInvite = useCallback(() => {
    setHostInviteModalDismissed(true);
  }, []);

  const reopenHostInviteModal = useCallback(() => {
    if (!hostInvite) return;
    setHostInviteModalDismissed(false);
  }, [hostInvite]);

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
      const prev = gameStateRef.current;
      const optimistic =
        prev && prev.board ? optimisticLocalMove(prev, cellIndex, userId) : null;
      if (optimistic) {
        applyGameStateToBoard(optimistic);
        playOwnMove();
      }
      try {
        const res = await emitAck<GameActionAckData>(
          emit,
          GameGatewaySocketEvent.GAME_ACTION,
          { message },
        );
        const mapped =
          res.data?.state != null
            ? ackStateToGameStatePayload(res.data.state)
            : null;
        if (mapped) {
          applyGameStateToBoard(mapped);
        }
        if (res.data?.finished) {
          setPhase(MpPhase.Ended);
        }
      } catch (e) {
        if (prev) {
          setGameState(prev);
        }
        toaster.create({
          title: 'Move failed',
          description: e instanceof Error ? e.message : 'Try again',
          type: 'error',
        });
      }
    },
    [emit, sessionId, userId, applyGameStateToBoard, playOwnMove],
  );

  const forfeitMatch = useCallback(async () => {
    if (!sessionId) return;
    const message = JSON.stringify({
      action: MultiplayerGamePayloadAction.FORFEIT,
      sessionId,
    });
    try {
      const res = await emitAck<GameActionAckData>(
        emit,
        GameGatewaySocketEvent.GAME_ACTION,
        { message },
      );
      const mapped =
        res.data?.state != null
          ? ackStateToGameStatePayload(res.data.state)
          : null;
      if (mapped) {
        applyGameStateToBoard(mapped);
      }
      if (res.data?.finished) {
        setPhase(MpPhase.Ended);
      }
      void getWalletData();
    } catch (e) {
      toaster.create({
        title: 'Forfeit failed',
        description: e instanceof Error ? e.message : 'Try again',
        type: 'error',
      });
    }
  }, [emit, sessionId, applyGameStateToBoard, getWalletData]);

  const resetMultiplayer = useCallback(() => {
    if (sessionId) leaveSessionRoom(sessionId);
    stopPolling();
    assignSessionId(null);
    setSessionRow(null);
    setGameState(null);
    setPhase(MpPhase.Idle);
    setMatchQueued(false);
    setHostInvite(null);
    setHostInviteModalDismissed(false);
    setRematchInvite(null);
    stripMultiplayerSearchParams();
  }, [
    sessionId,
    leaveSessionRoom,
    stopPolling,
    stripMultiplayerSearchParams,
    assignSessionId,
  ]);

  const { userIs, opponentIs } = userSymbols();
  const cells = cellsFromGameState();
  const status = betResultStatus();

  const showEndedOutcome = useMemo(
    () =>
      phase === MpPhase.Ended ||
      isServerTerminalBetStatus(gameState?.betResultStatus),
    [phase, gameState?.betResultStatus],
  );

  useEffect(() => {
    if (prevShowEndedOutcomeRef.current && !showEndedOutcome) {
      closeModal();
    }
    prevShowEndedOutcomeRef.current = showEndedOutcome;
  }, [showEndedOutcome, closeModal]);

  const currentTurn =
    phase === MpPhase.Playing && gameState?.currentTurn
      ? String(gameState.currentTurn)
      : '';
  const mpTurnLabel =
    phase === MpPhase.Playing && gameState?.currentTurn
      ? gameState.currentTurn === userIs
        ? 'Your turn'
        : "Opponent's turn"
      : '';

  const isActiveGame = useCallback(
    () =>
      phase === MpPhase.Playing &&
      !isServerTerminalBetStatus(gameState?.betResultStatus),
    [phase, gameState?.betResultStatus],
  );

  const hasEnded = useCallback(
    () =>
      phase === MpPhase.Ended ||
      isServerTerminalBetStatus(gameState?.betResultStatus),
    [phase, gameState?.betResultStatus],
  );

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
    if (!showEndedOutcome) {
      endedModalShownRef.current = false;
    }
  }, [showEndedOutcome]);

  useEffect(() => {
    if (
      !showEndedOutcome ||
      endedModalShownRef.current ||
      status === BET_STATUS.IN_PROGRESS ||
      status === BET_STATUS.NOT_STARTED
    ) {
      return;
    }
    endedModalShownRef.current = true;
    const activeCurrencyInfo =
      balances.find((c) => c.currency === currency) || selectedBalance;
    const handleRematch = () => {
      void requestRematch();
    };

    const handleCloseEnded = () => {
      closeModal();
      void cancelRematchIntent();
      resetMultiplayer();
    };

    const props = {
      multiplier: RiskLevel.MEDIUM,
      winAmount:
        status === BET_STATUS.WIN ? betAmount * parseFloatValue(RiskLevel.MEDIUM) : 0,
      betResultStatus: status,
      currency: activeCurrencyInfo,
      stakeAmount: betAmount,
      onRematch: handleRematch,
      onClose: handleCloseEnded,
      isRematchLoading: rematchBusy,
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
  }, [
    showEndedOutcome,
    status,
    betAmount,
    currency,
    balances,
    selectedBalance,
    openModal,
    closeModal,
    requestRematch,
    cancelRematchIntent,
    resetMultiplayer,
    rematchBusy,
  ]);

  const profitOnWin = localBetAmount * parseFloatValue(RiskLevel.MEDIUM);

  const mappedState: TictactoeState = {
    multiplier: RiskLevel.MEDIUM,
    betAmount: localBetAmount,
    profitOnWin,
    mode: GameMode.Manual,
    animSpeed: 0,
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
    showHostInviteModal: Boolean(hostInvite) && !hostInviteModalDismissed,
    quickMatchNoMatchOpen,
    multiplayerSession: sessionRow,
    mpTurnLabel,
    leaveLobbyPending,
    rematchInvite,
    rematchBusy,
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
      resolveLobbyFromPublicList,
      joinLobbyById,
      leavePendingLobby,
      sendMove,
      forfeitMatch,
      resetMultiplayer,
      handleBetAmountChange,
      syncActiveSession,
      dismissHostInvite,
      reopenHostInviteModal,
      dismissQuickMatchNoMatch: () => setQuickMatchNoMatchOpen(false),
      cancelQuickMatchSearch,
      clearInviteUrlParams: stripMultiplayerSearchParams,
      acceptRematchInvite,
      declineRematchInvite,
    },
  };
}
