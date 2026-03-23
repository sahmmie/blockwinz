import { useCallback, useEffect, useRef, useState } from 'react';
import { useSocketContext } from '@/context/socketContext';
import useAuth from '@/hooks/useAuth';
import { getUserIdFromAccessToken } from '@/shared/utils/jwtPayload';
import { DbGameSchema } from '@blockwinz/shared';
import { BOARD_SIZE, TOTAL_TILES } from '../constants';
import {
  BET_STATUS,
  IErrorMsg,
  MpPhase,
  RiskLevel,
  TictactoeState,
  TICTACTOE_TILE,
} from '../types';
import { GameMode } from '@blockwinz/shared';
import { parseFloatValue } from '@/shared/utils/common';
import useWalletState from '@/hooks/useWalletState';
import { useBetAmount } from '@/hooks/useBetAmount';
import { toaster } from '@/components/ui/toaster';
import useModal, { ModalProps } from '@/hooks/useModal';
import GameStatusModal from '../components/modals/GameStatusModal';

type WsAck<T = unknown> = {
  success: boolean;
  data: T;
  message?: string;
  code?: number;
};

export type MultiplayerSessionRow = {
  _id: string;
  gameStatus: string;
  players: string[];
  betAmount: number;
  currency: string;
  turnDeadlineAt?: string | null;
  reconnectGraceUntil?: string | null;
};

type GameStatePayload = {
  board?: Array<Array<string>>;
  players?: Array<{ userId: string; userIs: string; playerIsNext?: boolean }>;
  currentTurn?: string | null;
  betResultStatus?: string;
  winnerId?: string | null;
};

const GAME_TYPE = DbGameSchema.TicTacToeGame;

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
  if (status === 'tie') return BET_STATUS.TIE;
  if (status === 'in_progress') return BET_STATUS.IN_PROGRESS;
  if (status === 'win' && winnerId && myId) {
    return winnerId === myId ? BET_STATUS.WIN : BET_STATUS.LOSE;
  }
  return BET_STATUS.NOT_STARTED;
}

/**
 * Multiplayer Tic Tac Toe over the `game` Socket.IO namespace (sessions, matchmaking, moves).
 */
export function useMultiplayerTictactoe() {
  const { emit, on, off, getSocketInstance } = useSocketContext();
  const token = useAuth((s) => s.token);
  const userId = getUserIdFromAccessToken(token);
  const { selectedBalance, balances, getWalletData } = useWalletState();
  const { openModal } = useModal();

  const [phase, setPhase] = useState<MpPhase>('idle');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionRow, setSessionRow] = useState<MultiplayerSessionRow | null>(null);
  const [gameState, setGameState] = useState<GameStatePayload | null>(null);
  const [publicLobbies, setPublicLobbies] = useState<MultiplayerSessionRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [matchQueued, setMatchQueued] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMsg, setErrorMsg] = useState<IErrorMsg>({
    title: '',
    description: '',
  });

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  const leaveSessionRoom = useCallback(
    (sid: string) => {
      emit('leaveSessionRoom', { sessionId: sid });
    },
    [emit],
  );

  const joinSessionRoom = useCallback(
    async (sid: string) => {
      await emitAck(emit, 'joinSessionRoom', { sessionId: sid });
    },
    [emit],
  );

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

  useEffect(() => {
    const socket = getSocketInstance();
    if (!socket) return;

    const onStarted = (payload: {
      sessionId: string;
      state?: GameStatePayload | null;
    }) => {
      hydrateFromPayload(payload);
      setPhase('playing');
      setMatchQueued(false);
      stopPolling();
      if (payload.state) applyGameStateToBoard(payload.state);
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
      setPhase('ended');
      void getWalletData();
    };

    on('game.started', onStarted);
    on('game.move', onMove);
    on('game.invalidMove', onInvalid);
    on('game.finished', onFinished);

    return () => {
      off('game.started', onStarted);
      off('game.move', onMove);
      off('game.invalidMove', onInvalid);
      off('game.finished', onFinished);
    };
  }, [
    on,
    off,
    getSocketInstance,
    hydrateFromPayload,
    applyGameStateToBoard,
    stopPolling,
    getWalletData,
  ]);

  const syncActiveSession = useCallback(async () => {
    const res = await emitAck<MultiplayerSessionRow | null>(emit, 'getActiveGame', {
      gameType: GAME_TYPE,
    });
    const row = res.data as MultiplayerSessionRow & {
      gameState?: GameStatePayload;
    };
    if (!row || !row._id) {
      setSessionId(null);
      setSessionRow(null);
      setGameState(null);
      setPhase('idle');
      return null;
    }
    setSessionId(row._id);
    setSessionRow(row);
    if (row.gameState) {
      setGameState(row.gameState);
      applyGameStateToBoard(row.gameState);
    }
    if (row.gameStatus === 'pending') {
      setPhase('lobby');
    } else if (row.gameStatus === 'in_progress') {
      setPhase('playing');
    } else {
      setPhase('ended');
    }
    await joinSessionRoom(row._id);
    return row;
  }, [emit, joinSessionRoom, applyGameStateToBoard]);

  useEffect(() => {
    void syncActiveSession();
  }, [syncActiveSession]);

  const startQuickMatchPoll = useCallback(() => {
    stopPolling();
    pollRef.current = setInterval(() => {
      void (async () => {
        try {
          const res = await emitAck<MultiplayerSessionRow | null>(
            emit,
            'getActiveGame',
            {
              gameType: GAME_TYPE,
            },
          );
          const row = res.data as MultiplayerSessionRow & {
            gameState?: GameStatePayload;
          };
          if (row?._id) {
            stopPolling();
            setMatchQueued(false);
            setSessionId(row._id);
            setSessionRow(row);
            if (row.gameState) {
              setGameState(row.gameState);
              applyGameStateToBoard(row.gameState);
            }
            if (row.gameStatus === 'pending') setPhase('lobby');
            else if (row.gameStatus === 'in_progress') {
              setPhase('playing');
              if (row.gameState) applyGameStateToBoard(row.gameState);
            }
            await joinSessionRoom(row._id);
          }
        } catch {
          /* keep polling */
        }
      })();
    }, 2000);
  }, [emit, stopPolling, joinSessionRoom, applyGameStateToBoard]);

  const quickMatch = useCallback(async () => {
    if (!currency || localBetAmount <= 0) {
      toaster.create({
        title: 'Invalid bet',
        description: 'Choose amount and currency',
        type: 'error',
      });
      return;
    }
    setIsLoading(true);
    setHasError(false);
    try {
      const res = await emitAck<{ status: 'waiting' | 'matched' }>(
        emit,
        'quickMatch',
        {
          gameId: GAME_TYPE,
          betAmount: localBetAmount,
          currency,
        },
      );
      if (res.data.status === 'waiting') {
        setPhase('queued');
        setMatchQueued(true);
        startQuickMatchPoll();
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
    } finally {
      setIsLoading(false);
    }
  }, [
    currency,
    localBetAmount,
    emit,
    syncActiveSession,
    startQuickMatchPoll,
    stopPolling,
  ]);

  const hostPublicLobby = useCallback(async () => {
    if (!currency || localBetAmount <= 0) {
      toaster.create({
        title: 'Invalid bet',
        description: 'Choose amount and currency',
        type: 'error',
      });
      return;
    }
    setIsLoading(true);
    try {
      const res = await emitAck<MultiplayerSessionRow>(emit, 'newGame', {
        gameType: GAME_TYPE,
        betAmount: localBetAmount,
        currency,
        visibility: 'public',
        maxPlayers: 2,
      });
      const row = res.data;
      setSessionId(row._id);
      setSessionRow(row);
      setPhase('lobby');
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
  }, [currency, localBetAmount, emit, joinSessionRoom]);

  const refreshPublicLobbies = useCallback(async () => {
    try {
      const res = await emitAck<MultiplayerSessionRow[]>(
        emit,
        'listPublicLobbies',
        {
          gameType: GAME_TYPE,
        },
      );
      setPublicLobbies(Array.isArray(res.data) ? res.data : []);
    } catch {
      setPublicLobbies([]);
    }
  }, [emit]);

  const joinLobbyById = useCallback(
    async (gameId: string, joinCode?: string) => {
      setIsLoading(true);
      try {
        const res = await emitAck<MultiplayerSessionRow>(emit, 'joinGame', {
          gameId,
          joinCode,
        });
        const row = res.data;
        setSessionId(row._id);
        setSessionRow(row);
        if (row.gameStatus === 'pending') setPhase('lobby');
        else setPhase('playing');
        await joinSessionRoom(row._id);
        await syncActiveSession();
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
      await emitAck(emit, 'leaveGame', { gameId: sessionId });
      leaveSessionRoom(sessionId);
    } catch {
      /* ignore */
    }
    setSessionId(null);
    setSessionRow(null);
    setGameState(null);
    setPhase('idle');
    stopPolling();
    setMatchQueued(false);
  }, [emit, sessionId, leaveSessionRoom, stopPolling]);

  const sendMove = useCallback(
    async (cellIndex: number) => {
      if (!sessionId || !userId) return;
      const row = Math.floor(cellIndex / BOARD_SIZE);
      const col = cellIndex % BOARD_SIZE;
      const message = JSON.stringify({
        action: 'move',
        sessionId,
        move: { row, col },
      });
      try {
        await emitAck(emit, 'gameAction', { message });
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
    setPhase('idle');
    setMatchQueued(false);
  }, [sessionId, leaveSessionRoom, stopPolling]);

  const { userIs, opponentIs } = userSymbols();
  const cells = cellsFromGameState();
  const status = betResultStatus();

  const isActiveGame = useCallback(
    () => phase === 'playing',
    [phase],
  );

  const hasEnded = useCallback(() => phase === 'ended', [phase]);

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
    if (phase !== 'ended') {
      endedModalShownRef.current = false;
    }
  }, [phase]);

  useEffect(() => {
    if (
      phase !== 'ended' ||
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
      hostPublicLobby,
      refreshPublicLobbies,
      joinLobbyById,
      leavePendingLobby,
      sendMove,
      resetMultiplayer,
      handleBetAmountChange,
      syncActiveSession,
    },
  };
}
