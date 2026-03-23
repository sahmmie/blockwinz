import { MultiplayerGameTypeEnum } from '@blockwinz/shared';

/**
 * Short bullet points for the multiplayer Lobbies hub (per title).
 */
export const multiplayerLobbyHighlights: Record<
  MultiplayerGameTypeEnum,
  string[]
> = {
  [MultiplayerGameTypeEnum.TicTacToeGame]: [
    '2 players · turn-based',
    'Quick match, browse open lobbies, host public or private games',
    'Join friends with a session ID + join code',
    'Real stakes with provably fair outcomes',
  ],
};
