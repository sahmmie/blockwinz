import { isLobbyHubStatic } from '@/casinoGames/multiplayer/isLobbyHubStatic';
import { LOBBIES_HUB_STATIC_TABS } from '@/casinoGames/multiplayer/lobbiesHubStaticData';
import type { LobbyHubTab } from '@/casinoGames/multiplayer/lobbiesHubStaticData';
import { multiplayerGamesInfo } from '@/shared/constants/multiplayerGamesInfo.constant';
import { MultiplayerGameTypeEnum } from '@blockwinz/shared';

/** Tabs for the lobbies hub (static preview or real multiplayer catalogue). */
export function getLobbiesHubTabs(): LobbyHubTab[] {
  if (isLobbyHubStatic()) {
    return LOBBIES_HUB_STATIC_TABS;
  }
  return Object.values(multiplayerGamesInfo).map((g) => ({
    key: g.id,
    gameType: g.id as MultiplayerGameTypeEnum,
    game: g,
    comingSoon: g.comingSoon,
  }));
}
