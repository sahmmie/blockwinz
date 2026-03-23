/**
 * Session row from `listPublicLobbies`, `newGame`, `joinGame`, etc.
 */
export type MultiplayerSessionRow = {
  _id: string;
  gameStatus: string;
  players: string[];
  betAmount: number;
  currency: string;
  maxPlayers?: number;
  hostUserId?: string | null;
  visibility?: 'public' | 'private';
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
  visibility: 'public' | 'private';
  /** Required when visibility is private (client-generated or user-entered). */
  joinCode?: string;
  betAmountMustEqual?: boolean;
  maxPlayers?: number;
};

export type MultiplayerPanelTab = 'quick' | 'lobbies' | 'create' | 'join';

/** Shown after `newGame`; join code is only available client-side for private lobbies. */
export type HostInviteInfo = {
  sessionId: string;
  visibility: 'public' | 'private';
  plaintextJoinCode?: string;
  betAmount: number;
  currency: string;
};
