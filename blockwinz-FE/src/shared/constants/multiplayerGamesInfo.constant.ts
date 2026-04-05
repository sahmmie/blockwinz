import { GameCategoryEnum, MultiplayerGameTypeEnum } from '@blockwinz/shared';
import { GameInfo } from '../types/types';
import TicTacToeImage from '@/assets/games-info-images/xando-iamge.png';

// Icons
import TicTacToeIcon from '@/assets/icons/tic-tac-toe-icon.svg';
import QuoridorIcon from '@/assets/icons/quoridor-icon.svg';

/** Full rules for the “How to play” dialog on the Quoridor page. */
export const QUORIDOR_HOW_TO_PLAY = `Goal
Be the first to move your pawn onto any square of the row opposite your starting edge.

On your turn (choose one)
• Move your pawn one step orthogonally (up, down, left, or right) into an empty square.
• Jump — if your opponent is directly in front of you and the square beyond them is empty, you may jump straight over them. When you are side‑by‑side, you may jump diagonally behind them if that square is free. Along the board edge, sideways jumps follow the same “land behind” idea when legal.
• Place one wall — if you still have walls left, put a wall on a valid gap between intersections. A wall always spans two adjacent squares in a line.

Walls
• Each player begins with ten walls.
• You may not place a wall that leaves either player with no path at all to their goal row (every pawn must always have some route to the opposite side).

Multiplayer
Use the sidebar to host, browse open rooms, or join with a code. When it is not your turn, wait for your opponent; the board highlights legal moves on your turn.`;

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
    [MultiplayerGameTypeEnum.QuoridorGame]: {
        name: 'Quoridor',
        description:
            'Race to the opposite side of a 9×9 board while placing walls to slow your opponent. Classic turn-based strategy for two players with full rules: jumps, diagonal escapes, and path-preserving walls.',
        image: TicTacToeImage,
        link: '/multiplayer/quoridor',
        id: MultiplayerGameTypeEnum.QuoridorGame,
        category: GameCategoryEnum.MULTIPLAYER,
        releasedAt: new Date('2026-04-01'),
        icon: QuoridorIcon,
    },
};