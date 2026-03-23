import OriginalsIcon from '@/assets/bw-icon-only.svg';
import AffiliateIcon from '@/assets/icons/affliate-icon.svg';
import CasinoIcon from '@/assets/icons/casino-icon.svg';
import ChallengesIcon from '@/assets/icons/challenges-icon.svg';
import ChatAltIcon from '@/assets/icons/chat-alt-icon.svg';
import ProvablyFairIcon from '@/assets/icons/checkmark-icon.svg';
import FavouritesIcon from '@/assets/icons/favourite-icon.svg';
import HomeIcon from '@/assets/icons/home-icon.svg';

import LogoutIcon from '@/assets/icons/log-out-icon.svg';
import MenuIcon from '@/assets/icons/menu-icon.svg';
import MultiplayerBlackIcon from '@/assets/icons/multiplayer-black-icon.svg';
import MultiplayerIcon from '@/assets/icons/multiplayer-icon.svg';
import WaitingRoomIcon from '@/assets/icons/waiting-room-icon.svg';
import MyBetsIcon from '@/assets/icons/my-bets-icon.svg';
import NewReleasesIcon from '@/assets/icons/new-releases-icon.svg';
import CasinoWhiteIcon from '@/assets/icons/outline-casino-white.svg';
import OutlineCasinoIcon from '@/assets/icons/outline-casino.svg';
import OnlineSupportIcon from '@/assets/icons/support-icon.svg';
import ProviderIcon from '@/assets/icons/top-proivders-icon.svg';
import AccountIcon from '@/assets/icons/user-icon.svg';
import { multiplayerGamesInfo } from '@/shared/constants/multiplayerGamesInfo.constant';

import { originalGamesInfo } from '@/shared/constants/originalGamesInfo.constant';
import { GameCategoryEnum } from '@blockwinz/shared';

export type SideBarLink = {
  icon: string;
  label: string;
  link: string | null;
  subMenuTitle?: string;
  showDivider?: boolean;
  /** Only shown when the sidebar Multiplayer tab is selected. */
  multiplayerOnly?: boolean;
  clickOnly?: string;
  authOnly?: boolean;
}

export const settingsSidebarLinks: SideBarLink[] = [
  {
    icon: ProvablyFairIcon,
    label: 'Provably Fair',
    link: '/provably-fair',
  },
  {
    icon: AccountIcon,
    label: 'Account',
    link: '/profile',
    authOnly: true,
  },
  {
    icon: AffiliateIcon,
    label: 'Affiliate',
    link: '/affiliate',
  },
  {
    icon: ProviderIcon,
    label: 'Providers',
    link: '/providers',
  },
  {
    icon: OnlineSupportIcon,
    label: 'Online support',
    link: null,
    clickOnly: 'online-support',
  },
  {
    icon: LogoutIcon,
    label: 'Log Out',
    link: null,
    clickOnly: 'logout',
    authOnly: true,
  }
]

export const mainSidebarLinks: SideBarLink[] = [
  {
    icon: HomeIcon,
    label: 'Home',
    link: '/',
  },
  {
    icon: OriginalsIcon,
    label: 'Games',
    link: '/games',
  },
  {
    icon: ChallengesIcon,
    label: 'Challenges',
    link: '/challenges',
  },
  {
    icon: MyBetsIcon,
    label: 'My Bets',
    link: '/bet-history',
  },
  {
    icon: FavouritesIcon,
    label: 'Favourites',
    link: '/favourites',
  },
  {
    icon: NewReleasesIcon,
    label: 'New Releases',
    link: '/new-releases',
  },
  {
    icon: WaitingRoomIcon,
    label: 'Lobbies',
    link: '/lobbies',
    multiplayerOnly: true,
  },
]

export const originalGamesSidebarLinks: SideBarLink[] = [
  {
    icon: originalGamesInfo.LimboGame.icon,
    label: originalGamesInfo.LimboGame.name,
    link: originalGamesInfo.LimboGame.link,
  },
  {
    icon: originalGamesInfo.DiceGame.icon,
    label: originalGamesInfo.DiceGame.name,
    link: originalGamesInfo.DiceGame.link,
  },
  {
    icon: originalGamesInfo.CoinFlipGame.icon,
    label: originalGamesInfo.CoinFlipGame.name,
    link: originalGamesInfo.CoinFlipGame.link,
  },
  {
    icon: originalGamesInfo.MinesGame.icon,
    label: originalGamesInfo.MinesGame.name,
    link: originalGamesInfo.MinesGame.link,
  },
  {
    icon: originalGamesInfo.KenoGame.icon,
    label: originalGamesInfo.KenoGame.name,
    link: originalGamesInfo.KenoGame.link,
  },
  {
    icon: originalGamesInfo.WheelGame.icon,
    label: originalGamesInfo.WheelGame.name,
    link: originalGamesInfo.WheelGame.link,
  },
  {
    icon: originalGamesInfo.PlinkoGame.icon,
    label: originalGamesInfo.PlinkoGame.name,
    link: originalGamesInfo.PlinkoGame.link,
    showDivider: true,
  },
]

export const multiplayerGamesSidebarLinks: SideBarLink[] = [
  {
    icon: multiplayerGamesInfo.TicTacToeGame.icon,
    label: multiplayerGamesInfo.TicTacToeGame.name,
    link: multiplayerGamesInfo.TicTacToeGame.link,
    showDivider: true,
  },
];

export const BottomNavData: SideBarLink[] = [
  {
    icon: MenuIcon,
    label: 'Menu',
    link: '/menu',
  },
  {
    icon: CasinoIcon,
    label: 'Games',
    link: '/originals',
  },
  {
    icon: MultiplayerIcon,
    label: 'Multiplayer',
    link: '/multiplayer',
  },
  {
    icon: MyBetsIcon,
    label: 'Bets',
    link: '/bet-history',
  },
  {
    icon: ChatAltIcon,
    label: 'Chat',
    link: '/chat',
  },
]

export const MainTabData: {
  label: string;
  link: GameCategoryEnum;
  icon: string;
  altIcon: string;
}[] = [
    {
      label: 'Originals',
      link: GameCategoryEnum.ORIGINALS,
      icon: OutlineCasinoIcon,
      altIcon: CasinoWhiteIcon,
    },
    {
      label: 'Multiplayer',
      link: GameCategoryEnum.MULTIPLAYER,
      icon: MultiplayerBlackIcon,
      altIcon: MultiplayerIcon,
    },
  ];