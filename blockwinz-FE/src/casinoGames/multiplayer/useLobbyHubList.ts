import { useCallback, useEffect, useState } from 'react';
import {
  DbGameSchema,
  GameGatewaySocketEvent,
  MultiplayerGameEmitterEvent,
  MultiplayerGameTypeEnum,
} from '@blockwinz/shared';
import { useSocketContext } from '@/context/socketContext';
import type { MultiplayerSessionRow } from './types';
import { MOCK_MULTIPLAYER_LOBBIES } from './multiplayerLobbyMock';
import { isMultiplayerLobbyMock } from './isMultiplayerLobbyMock';
import { isLobbyHubStatic } from './isLobbyHubStatic';
import { LOBBIES_HUB_STATIC_LOBBIES } from './lobbiesHubStaticData';

type WsAck<T = unknown> = {
  success: boolean;
  data: T;
  message?: string;
  code?: number;
};

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

/**
 * `listPublicLobbies` uses DB game ids. Returns `null` when the multiplayer
 * title has no server-side listing yet (empty list, no bogus emit).
 */
function dbGameSchemaForLobbyList(
  id: MultiplayerGameTypeEnum,
): DbGameSchema | null {
  switch (id) {
    case MultiplayerGameTypeEnum.TicTacToeGame:
      return DbGameSchema.TicTacToeGame;
    case MultiplayerGameTypeEnum.CoinFlipGame:
      return DbGameSchema.CoinFlipGame;
    case MultiplayerGameTypeEnum.CrashGame:
      return DbGameSchema.CrashGame;
    case MultiplayerGameTypeEnum.DiceDuelGame:
      return DbGameSchema.DiceGame;
    case MultiplayerGameTypeEnum.QuoridorGame:
      return DbGameSchema.QuoridorGame;
    default:
      return null;
  }
}

const REFRESH_MS = 8000;

/**
 * Public lobbies for the `/lobbies` hub (game socket `listPublicLobbies`).
 * Pass `null` when the selected tab has no live title yet (empty list).
 */
export function useLobbyHubList(gameType: MultiplayerGameTypeEnum | null) {
  const { emit, on, off } = useSocketContext();
  const [lobbies, setLobbies] = useState<MultiplayerSessionRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastFetchedAt, setLastFetchedAt] = useState<Date | null>(null);

  const refresh = useCallback(
    async (opts?: { silent?: boolean }) => {
      if (isLobbyHubStatic()) {
        setLobbies(
          gameType === MultiplayerGameTypeEnum.TicTacToeGame
            ? LOBBIES_HUB_STATIC_LOBBIES
            : [],
        );
        setLastFetchedAt(new Date());
        if (!opts?.silent) setIsLoading(false);
        return;
      }
      if (isMultiplayerLobbyMock()) {
        setLobbies(MOCK_MULTIPLAYER_LOBBIES);
        setLastFetchedAt(new Date());
        if (!opts?.silent) setIsLoading(false);
        return;
      }
      if (gameType === null) {
        setLobbies([]);
        setLastFetchedAt(new Date());
        if (!opts?.silent) setIsLoading(false);
        return;
      }
      const schema = dbGameSchemaForLobbyList(gameType);
      if (schema === null) {
        setLobbies([]);
        setLastFetchedAt(new Date());
        if (!opts?.silent) setIsLoading(false);
        return;
      }
      if (!opts?.silent) setIsLoading(true);
      try {
        const res = await emitAck<MultiplayerSessionRow[]>(
          emit,
          GameGatewaySocketEvent.LIST_PUBLIC_LOBBIES,
          {
            gameType: schema,
          },
        );
        setLobbies(Array.isArray(res.data) ? res.data : []);
        setLastFetchedAt(new Date());
      } catch {
        setLobbies([]);
      } finally {
        if (!opts?.silent) setIsLoading(false);
      }
    },
    [emit, gameType],
  );

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    const id = window.setInterval(() => {
      void refresh({ silent: true });
    }, REFRESH_MS);
    return () => window.clearInterval(id);
  }, [refresh]);

  /** Live updates on `/lobbies` when the hub is not static/mock. */
  useEffect(() => {
    if (isLobbyHubStatic() || isMultiplayerLobbyMock()) return;
    if (gameType === null) return;
    const schema = dbGameSchemaForLobbyList(gameType);
    if (schema === null) return;

    const bump = () => {
      void refresh({ silent: true });
    };
    on(MultiplayerGameEmitterEvent.LOBBY_UPDATED, bump);
    on(MultiplayerGameEmitterEvent.LOBBY_EXPIRED, bump);
    void emitAck(emit, GameGatewaySocketEvent.JOIN_LOBBY_ROOM, {
      gameType: schema,
    }).catch(() => {});

    return () => {
      off(MultiplayerGameEmitterEvent.LOBBY_UPDATED, bump);
      off(MultiplayerGameEmitterEvent.LOBBY_EXPIRED, bump);
      void emitAck(emit, GameGatewaySocketEvent.LEAVE_LOBBY_ROOM, {
        gameType: schema,
      }).catch(() => {});
    };
  }, [emit, on, off, gameType, refresh]);

  return { lobbies, isLoading, lastFetchedAt, refresh };
}
