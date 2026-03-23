import { GameCategoryEnum, MultiplayerGameTypeEnum } from '@blockwinz/shared';
import { GameInfo } from '../types/types';
import TicTacToeImage from '@/assets/games-info-images/xando-iamge.png';

// Icons
import TicTacToeIcon from '@/assets/icons/tic-tac-toe-icon.svg';

/** Shipped titles only; other `MultiplayerGameTypeEnum` values are listed on `/lobbies` static preview. */
export const multiplayerGamesInfo: Partial<
  Record<MultiplayerGameTypeEnum, GameInfo>
> = {
    [MultiplayerGameTypeEnum.TicTacToeGame]: {
        name: 'Tic Tac Toe',
        description: `TicTacToe on Blockwinz brings a classic strategy game into the high-stakes world of crypto gaming. Challenge real opponents in fast-paced, turn-based matches where every move counts. Outsmart your rival, claim victory, and earn instant rewards. Whether you're playing for fun or going all-in, TicTacToe tests your focus, logic, and timing. With sleek multiplayer gameplay, competitive matchmaking, and real crypto on the line, it’s not just a game—it’s a battle of minds. Will you think ahead or fall behind? Make your move and dominate the grid!`,
        image: TicTacToeImage,
        link: '/multiplayer/tictactoe',
        id: MultiplayerGameTypeEnum.TicTacToeGame,
        category: GameCategoryEnum.MULTIPLAYER,
        releasedAt: new Date('2025-02-01'),
        icon: TicTacToeIcon,
    },
};