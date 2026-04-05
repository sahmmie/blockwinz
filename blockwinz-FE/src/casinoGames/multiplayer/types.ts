import type {
  LobbyVisibility,
  MultiplayerGameTypeEnum,
  MultiplayerSessionStatus,
} from '@blockwinz/shared';

/**
 * Session row from `listPublicLobbies`, `newGame`, `joinGame`, etc.
 */
export type MultiplayerSessionRow = {
  _id: string;
  gameStatus: MultiplayerSessionStatus | string;
  players: string[];
  betAmount: number;
  currency: string;
  maxPlayers?: number;
  hostUserId?: string | null;
  visibility?: LobbyVisibility | string;
  betAmountMustEqual?: boolean;
  joinCodeHash?: string | null;
  turnDeadlineAt?: string | null;
  reconnectGraceUntil?: string | null;
};

/**
 * Payload for hosting a multiplayer lobby via `newGame`.
 */
export type CreateLobbyParams = {
  betAmount: number;
  currency: string;
  visibility: LobbyVisibility;
  /** Required when visibility is private (client-generated or user-entered). */
  joinCode?: string;
  betAmountMustEqual?: boolean;
  maxPlayers?: number;
};

export type MultiplayerPanelTab = 'lobbies' | 'create' | 'join';

/** Shown after `newGame`; join code is only available client-side for private lobbies. */
export type HostInviteInfo = {
  sessionId: string;
  visibility: LobbyVisibility;
  plaintextJoinCode?: string;
  betAmount: number;
  currency: string;
  /** Drives invite URL and copy text (`multiplayerGamesInfo` must define this id). */
  gameType: MultiplayerGameTypeEnum;
};
