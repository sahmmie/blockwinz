import {
  Currency,
  GameCategoryEnum,
  LobbyVisibility,
  MultiplayerGameTypeEnum,
  MultiplayerSessionStatus,
} from '@blockwinz/shared';
import type { GameInfo } from '@/shared/types/types';
import type { MultiplayerSessionRow } from './types';

import TicTacToeImage from '@/assets/games-info-images/xando-iamge.png';
import CoinflipImage from '@/assets/icons/coin-flip-icon.png';

import TableGamesIcon from '@/assets/icons/table-games-icon.svg';
import WheelIcon from '@/assets/icons/wheel-icon.svg';
import CardsIcon from '@/assets/icons/coin-stack.svg';
import TicTacToeIcon from '@/assets/icons/tic-tac-toe-icon.svg';
import RPSIcon from '@/assets/icons/sport-icon.svg';
import DiceIcon from '@/assets/icons/dice-icon.svg';
import GoldCoinIcon from '@/assets/icons/gold-coin-icon.svg';
import GridIcon from '@/assets/icons/list-icon.svg';
import JackpotIcon from '@/assets/icons/promotion-icon.svg';
import MinesIcon from '@/assets/icons/mines-icon.svg';
import NumbersIcon from '@/assets/icons/keno-icon.svg';
import CrashIcon from '@/assets/icons/trend-icon.svg';

export type LobbyHubTab = {
  key: string;
  gameType: MultiplayerGameTypeEnum | null;
  game: GameInfo;
  comingSoon?: boolean;
};

/** Placeholder art until per-title hero assets exist (same as Tic Tac Toe grid). */
const placeholderImage = TicTacToeImage;

function createGame(
  input: Omit<GameInfo, 'category'> & { id: MultiplayerGameTypeEnum },
): GameInfo {
  return {
    ...input,
    category: GameCategoryEnum.MULTIPLAYER,
  };
}

/**
 * `/lobbies` static preview — your launch + roadmap lineup.
 * Only Tic Tac Toe has sample rows in `LOBBIES_HUB_STATIC_LOBBIES` until backends exist.
 */
export const LOBBIES_HUB_STATIC_TABS: LobbyHubTab[] = [
  // 🟢 LIVE GAMES (Launch Ready)
  {
    key: 'tictactoe',
    gameType: MultiplayerGameTypeEnum.TicTacToeGame,
    game: createGame({
      id: MultiplayerGameTypeEnum.TicTacToeGame,
      name: 'Tic Tac Toe',
      description: 'Classic 1v1 strategy game.',
      icon: TicTacToeIcon,
      image: TicTacToeImage,
      link: '/multiplayer/tictactoe',
      releasedAt: new Date('2025-02-01'),
    }),
  },
  {
    key: 'coinflip',
    gameType: MultiplayerGameTypeEnum.CoinFlipGame,
    game: createGame({
      id: MultiplayerGameTypeEnum.CoinFlipGame,
      name: 'Coinflip Duel',
      description: 'Fast 1v1 coin toss betting.',
      icon: GoldCoinIcon,
      image: CoinflipImage,
      link: '/multiplayer/coinflip',
    }),
  },
  {
    key: 'rps',
    gameType: MultiplayerGameTypeEnum.RPSGame,
    game: createGame({
      id: MultiplayerGameTypeEnum.RPSGame,
      name: 'Rock Paper Scissors',
      description: 'Quick PvP mind game.',
      icon: RPSIcon,
      image: placeholderImage,
      link: '/multiplayer/rps',
    }),
  },
  {
    key: 'dice-duel',
    gameType: MultiplayerGameTypeEnum.DiceDuelGame,
    game: createGame({
      id: MultiplayerGameTypeEnum.DiceDuelGame,
      name: 'Dice Duel',
      description: 'Roll high, win the pot.',
      icon: DiceIcon,
      image: placeholderImage,
      link: '/multiplayer/dice-duel',
    }),
  },
  {
    key: 'connect-four',
    gameType: MultiplayerGameTypeEnum.ConnectFourGame,
    game: createGame({
      id: MultiplayerGameTypeEnum.ConnectFourGame,
      name: 'Connect Four',
      description: 'Drop discs, connect four to win.',
      icon: GridIcon,
      image: placeholderImage,
      link: '/multiplayer/connect-four',
    }),
  },
  {
    key: 'dots-boxes',
    gameType: MultiplayerGameTypeEnum.DotsBoxesGame,
    game: createGame({
      id: MultiplayerGameTypeEnum.DotsBoxesGame,
      name: 'Dots & Boxes',
      description: 'Draw lines, claim boxes.',
      icon: GridIcon,
      image: placeholderImage,
      link: '/multiplayer/dots-boxes',
    }),
  },
  {
    key: 'memory',
    gameType: MultiplayerGameTypeEnum.MemoryGame,
    game: createGame({
      id: MultiplayerGameTypeEnum.MemoryGame,
      name: 'Memory Match',
      description: 'Find pairs faster than your opponent.',
      icon: CardsIcon,
      image: placeholderImage,
      link: '/multiplayer/memory',
    }),
  },
  {
    key: 'crash',
    gameType: MultiplayerGameTypeEnum.CrashGame,
    game: createGame({
      id: MultiplayerGameTypeEnum.CrashGame,
      name: 'Crash',
      description: 'Cash out before it crashes.',
      icon: CrashIcon,
      image: placeholderImage,
      link: '/multiplayer/crash',
    }),
  },
  {
    key: 'jackpot',
    gameType: MultiplayerGameTypeEnum.JackpotGame,
    game: createGame({
      id: MultiplayerGameTypeEnum.JackpotGame,
      name: 'Jackpot',
      description: 'Enter pool, one winner takes all.',
      icon: JackpotIcon,
      image: placeholderImage,
      link: '/multiplayer/jackpot',
    }),
  },
  {
    key: 'lucky-numbers',
    gameType: MultiplayerGameTypeEnum.LuckyNumbersGame,
    game: createGame({
      id: MultiplayerGameTypeEnum.LuckyNumbersGame,
      name: 'Lucky Numbers',
      description: 'Pick numbers and win from the pool.',
      icon: NumbersIcon,
      image: placeholderImage,
      link: '/multiplayer/lucky-numbers',
    }),
  },

  // 🟡 COMING SOON (Future Expansion)
  {
    key: 'battleship',
    gameType: MultiplayerGameTypeEnum.BattleshipGame,
    game: createGame({
      id: MultiplayerGameTypeEnum.BattleshipGame,
      name: 'Battleship',
      description: 'Naval grid combat.',
      icon: MinesIcon,
      image: placeholderImage,
      link: '/multiplayer/battleship',
      comingSoon: true,
    }),
    comingSoon: true,
  },
  {
    key: 'checkers',
    gameType: MultiplayerGameTypeEnum.CheckersGame,
    game: createGame({
      id: MultiplayerGameTypeEnum.CheckersGame,
      name: 'Checkers',
      description: 'Classic capture strategy.',
      icon: WheelIcon,
      image: placeholderImage,
      link: '/multiplayer/checkers',
      comingSoon: true,
    }),
    comingSoon: true,
  },
  {
    key: 'dominoes',
    gameType: MultiplayerGameTypeEnum.DominoesGame,
    game: createGame({
      id: MultiplayerGameTypeEnum.DominoesGame,
      name: 'Dominoes',
      description: 'Block and draw gameplay.',
      icon: TableGamesIcon,
      image: placeholderImage,
      link: '/multiplayer/dominoes',
      comingSoon: true,
    }),
    comingSoon: true,
  },
];

export const LOBBIES_HUB_STATIC_LOBBIES: MultiplayerSessionRow[] = [
  {
    _id: 'static-lobby-001',
    gameStatus: MultiplayerSessionStatus.PENDING,
    players: ['aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'],
    betAmount: 5,
    currency: Currency.BWZ,
    maxPlayers: 2,
    hostUserId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    visibility: LobbyVisibility.PUBLIC,
    betAmountMustEqual: false,
    turnDeadlineAt: null,
    reconnectGraceUntil: null,
  },
  {
    _id: 'static-lobby-002',
    gameStatus: MultiplayerSessionStatus.PENDING,
    players: ['bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'],
    betAmount: 25,
    currency: Currency.BWZ,
    maxPlayers: 2,
    hostUserId: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    visibility: LobbyVisibility.PUBLIC,
    betAmountMustEqual: true,
    turnDeadlineAt: null,
    reconnectGraceUntil: null,
  },
  {
    _id: 'static-lobby-003',
    gameStatus: MultiplayerSessionStatus.PENDING,
    players: ['cccccccc-cccc-cccc-cccc-cccccccccccc'],
    betAmount: 100,
    currency: Currency.SOL,
    maxPlayers: 2,
    hostUserId: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
    visibility: LobbyVisibility.PUBLIC,
    betAmountMustEqual: false,
    turnDeadlineAt: null,
    reconnectGraceUntil: null,
  },
  {
    _id: 'static-lobby-004',
    gameStatus: MultiplayerSessionStatus.PENDING,
    players: [
      'dddddddd-dddd-dddd-dddd-dddddddddddd',
      'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
    ],
    betAmount: 10,
    currency: Currency.BWZ,
    maxPlayers: 2,
    hostUserId: 'dddddddd-dddd-dddd-dddd-dddddddddddd',
    visibility: LobbyVisibility.PUBLIC,
    betAmountMustEqual: false,
    turnDeadlineAt: null,
    reconnectGraceUntil: null,
  },
  {
    _id: 'static-lobby-005',
    gameStatus: MultiplayerSessionStatus.PENDING,
    players: ['ffffffff-ffff-ffff-ffff-ffffffffffff'],
    betAmount: 0.5,
    currency: Currency.SOL,
    maxPlayers: 2,
    hostUserId: 'ffffffff-ffff-ffff-ffff-ffffffffffff',
    visibility: LobbyVisibility.PUBLIC,
    betAmountMustEqual: false,
    turnDeadlineAt: null,
    reconnectGraceUntil: null,
  },
  {
    _id: 'static-lobby-006',
    gameStatus: MultiplayerSessionStatus.PENDING,
    players: ['99999999-9999-9999-9999-999999999999'],
    betAmount: 50,
    currency: Currency.BWZ,
    maxPlayers: 4,
    hostUserId: '99999999-9999-9999-9999-999999999999',
    visibility: LobbyVisibility.PUBLIC,
    betAmountMustEqual: false,
    turnDeadlineAt: null,
    reconnectGraceUntil: null,
  },
];
