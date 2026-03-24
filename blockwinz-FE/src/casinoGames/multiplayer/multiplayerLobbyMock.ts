import {
  Currency,
  LobbyVisibility,
  MultiplayerSessionStatus,
} from '@blockwinz/shared';
import type { MultiplayerSessionRow } from './types';

/**
 * Static lobbies for `VITE_MULTIPLAYER_LOBBY_MOCK` UI testing (no socket).
 */
export const MOCK_MULTIPLAYER_LOBBIES: MultiplayerSessionRow[] = [
  {
    _id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0001',
    gameStatus: MultiplayerSessionStatus.PENDING,
    players: ['11111111-1111-1111-1111-111111111111'],
    betAmount: 10,
    currency: Currency.BWZ,
    maxPlayers: 2,
    hostUserId: '11111111-1111-1111-1111-111111111111',
    visibility: LobbyVisibility.PUBLIC,
    betAmountMustEqual: false,
    turnDeadlineAt: null,
    reconnectGraceUntil: null,
  },
  {
    _id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0002',
    gameStatus: MultiplayerSessionStatus.PENDING,
    players: ['22222222-2222-2222-2222-222222222222'],
    betAmount: 50,
    currency: Currency.BWZ,
    maxPlayers: 2,
    hostUserId: '22222222-2222-2222-2222-222222222222',
    visibility: LobbyVisibility.PUBLIC,
    betAmountMustEqual: true,
    turnDeadlineAt: null,
    reconnectGraceUntil: null,
  },
  {
    _id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0003',
    gameStatus: MultiplayerSessionStatus.PENDING,
    players: ['33333333-3333-3333-3333-333333333333'],
    betAmount: 5,
    currency: Currency.SOL,
    maxPlayers: 2,
    hostUserId: '33333333-3333-3333-3333-333333333333',
    visibility: LobbyVisibility.PUBLIC,
    betAmountMustEqual: false,
    turnDeadlineAt: null,
    reconnectGraceUntil: null,
  },
];
