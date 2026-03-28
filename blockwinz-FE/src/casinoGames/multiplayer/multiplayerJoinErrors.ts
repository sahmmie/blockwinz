/**
 * Stable keys for multiplayer join / invite failures (maps server codes + messages).
 */
export enum MultiplayerJoinErrorKey {
  SessionNotFound = 'SESSION_NOT_FOUND',
  SessionNotJoinable = 'SESSION_NOT_JOINABLE',
  SessionFull = 'SESSION_FULL',
  InviteRequired = 'INVITE_REQUIRED',
  JoinFailed = 'JOIN_FAILED',
  Unknown = 'UNKNOWN',
}

export type MultiplayerJoinErrorEntry = {
  key: MultiplayerJoinErrorKey;
  /** Human-readable title for toasts / modals */
  title: string;
  description: string;
  /** Strip `?session=` / `?code=` so stale invites don’t reopen the join modal */
  clearInviteUrl: boolean;
};

const SESSION_NOT_FOUND: MultiplayerJoinErrorEntry = {
  key: MultiplayerJoinErrorKey.SessionNotFound,
  title: 'Table not found',
  description:
    'This link is invalid or the table no longer exists. Ask the host for a new invite.',
  clearInviteUrl: true,
};

const SESSION_NOT_JOINABLE: MultiplayerJoinErrorEntry = {
  key: MultiplayerJoinErrorKey.SessionNotJoinable,
  title: 'Table closed',
  description:
    'This match has ended or the lobby is no longer open. You can start a new table from the panel.',
  clearInviteUrl: true,
};

const SESSION_FULL: MultiplayerJoinErrorEntry = {
  key: MultiplayerJoinErrorKey.SessionFull,
  title: 'Table is full',
  description: 'This table already has the maximum number of players.',
  clearInviteUrl: true,
};

const INVITE_REQUIRED: MultiplayerJoinErrorEntry = {
  key: MultiplayerJoinErrorKey.InviteRequired,
  title: 'Invite required',
  description:
    'You need an invite for this private table, or the correct join code.',
  clearInviteUrl: false,
};

const JOIN_FAILED: MultiplayerJoinErrorEntry = {
  key: MultiplayerJoinErrorKey.JoinFailed,
  title: 'Could not join',
  description: 'The server could not seat you. Try again or use another table.',
  clearInviteUrl: true,
};

const UNKNOWN: MultiplayerJoinErrorEntry = {
  key: MultiplayerJoinErrorKey.Unknown,
  title: 'Could not join',
  description: 'Something went wrong. Check the link or try again.',
  clearInviteUrl: true,
};

/**
 * Map `WsResponse.code` + message from `joinGame` / related handlers to UI copy.
 */
export function resolveMultiplayerJoinError(
  httpCode?: number,
  message?: string,
): MultiplayerJoinErrorEntry {
  const msg = (message ?? '').trim();
  const lower = msg.toLowerCase();

  if (httpCode === 404 || lower.includes('session not found')) {
    return SESSION_NOT_FOUND;
  }

  if (
    httpCode === 400 &&
    (lower.includes('not joinable') ||
      lower.includes('session is not joinable'))
  ) {
    return SESSION_NOT_JOINABLE;
  }

  if (httpCode === 400 && lower.includes('session is full')) {
    return SESSION_FULL;
  }

  if (lower.includes('invalid join code')) {
    return {
      key: MultiplayerJoinErrorKey.Unknown,
      title: 'Wrong join code',
      description: 'Check the code with the host and try again.',
      clearInviteUrl: false,
    };
  }

  if (
    httpCode === 403 ||
    lower.includes('invite required') ||
    lower.includes('this session does not use a join code')
  ) {
    return INVITE_REQUIRED;
  }

  if (httpCode === 400 && lower.includes('stake')) {
    return {
      key: MultiplayerJoinErrorKey.Unknown,
      title: 'Stake mismatch',
      description: msg || 'Your stake or currency does not match this table.',
      clearInviteUrl: false,
    };
  }

  if (httpCode === 500 || lower.includes('failed to join')) {
    return { ...JOIN_FAILED, description: msg || JOIN_FAILED.description };
  }

  if (msg) {
    return {
      ...UNKNOWN,
      description: msg,
    };
  }

  return UNKNOWN;
}
