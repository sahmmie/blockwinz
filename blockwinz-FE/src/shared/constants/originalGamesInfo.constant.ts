import { GameCategoryEnum, GameTypeEnum } from '../enums/gameType.enum';
import { GameInfo } from '../types/types';
import LimboImage from '@/assets/games-info-images/limbo-image.png';
import PlinkoImage from '@/assets/games-info-images/plinko-image.png';
import MinesImage from '@/assets/games-info-images/mines-image.png';
import DiceImage from '@/assets/games-info-images/dice-image.png';
import CrashImage from '@/assets/games-info-images/crash-image.png';
import CoinFlipImage from '@/assets/games-info-images/coin-flip-image.png';
import KenoImage from '@/assets/games-info-images/keno-image.png';
import RouletteImage from '@/assets/games-info-images/roulette-image.png';
import BlackjackImage from '@/assets/games-info-images/blackjack-image.png';
import WheelImage from '@/assets/games-info-images/wheel-image.png';
import BaccaratImage from '@/assets/games-info-images/bacarrat-image.png';
import HiloImage from '@/assets/games-info-images/hilo-image.png';

// Icons 
import WheelIcon from '@/assets/icons/wheel-icon.svg';
import DiceIcon from '@/assets/icons/dice-icon.svg';
import KenoIcon from '@/assets/icons/keno-icon.svg';
import LimboIcon from '@/assets/icons/limbo-icon.svg';
import MinesIcon from '@/assets/icons/mines-icon.svg';
import PlinkoIcon from '@/assets/icons/plinko-icon.svg';

export const originalGamesInfo: Record<GameTypeEnum, GameInfo> = {
    [GameTypeEnum.DiceGame]: {
        name: 'Dice',
        description: 'Dice on Blockwinz is a fast and exciting game of chance where you roll the dice and predict the outcome to win big. Adjust your risk by setting your own odds—go for safer bets with high chances of winning or take a bold approach for massive payouts. With instant results, smooth gameplay, and a high RTP, Dice on Blockwinz lets you control your strategy while chasing thrilling rewards. Will you play it safe or take the ultimate risk? Roll the dice and find out!',
        image: DiceImage,
        link: '/originals/dice',
        id: GameTypeEnum.DiceGame,
        category: GameCategoryEnum.ORIGINALS,
        releasedAt: new Date('2025-02-01'),
        icon: DiceIcon,
    },
    [GameTypeEnum.MinesGame]: {
        name: 'Mines',
        description: `Mines on Blockwinz is an exhilarating game of risk and reward, where you reveal tiles to uncover hidden gems while avoiding dangerous mines. Each successful reveal boosts your payout, but hitting a mine ends the round instantly. With full control over your strategy, you can adjust the number of mines to increase both the challenge and potential winnings. Play it safe with minimal mines for steady wins or take a bold approach for massive multipliers. Featuring smooth gameplay, auto-play options, and a high RTP, Mines on Blockwinz delivers nonstop excitement and endless possibilities. So what are you waiting for? Join the Mines on Blockwinz community and start your journey today!`,
        image: MinesImage,
        link: '/originals/mines',
        id: GameTypeEnum.MinesGame,
        category: GameCategoryEnum.ORIGINALS,
        releasedAt: new Date('2025-03-01'),
        icon: MinesIcon,
    },
    [GameTypeEnum.LimboGame]: {
        name: 'Limbo',
        description: 'Limbo on Blockwinz is a high-speed betting game where you set your own target multiplier and watch as the number rises. Will it hit your goal, or will it crash too soon? The higher the multiplier you aim for, the bigger the risk—but also the greater the reward. With instant results, customizable bets, and a fair RTP, Limbo is all about striking the perfect balance between risk and reward. Do you cash out early or chase the big win? The choice is yours—take the leap and see how high you can go!',
        image: LimboImage,
        link: '/originals/limbo',
        id: GameTypeEnum.LimboGame,
        category: GameCategoryEnum.ORIGINALS,
        releasedAt: new Date('2025-01-01'),
        icon: LimboIcon,
    },
    [GameTypeEnum.KenoGame]: {
        name: 'Keno',
        description: 'Keno on Blockwinz is a classic lottery-style game where you pick your lucky numbers and watch as the draw unfolds. The more numbers you match, the higher your payout—hit all your picks for massive rewards! With flexible betting options, customizable number selections, and fast-paced draws, Keno combines luck and anticipation for a truly exciting experience. Whether you’re playing a few spots or going all-in, every round is a chance to win big. Choose your numbers, cross your fingers, and let the draw begin!',
        image: KenoImage,
        link: '/originals/keno',
        id: GameTypeEnum.KenoGame,
        category: GameCategoryEnum.ORIGINALS,
        releasedAt: new Date('2025-05-01'),
        icon: KenoIcon,
    },
    [GameTypeEnum.PlinkoGame]: {
        name: 'Plinko',
        description: 'Plinko on Blockwinz is a thrilling game of chance where you drop a ball down a peg-filled board, watching it bounce unpredictably until it lands in a multiplier slot. The closer it lands to the edges, the bigger the payout! Customize your risk level by adjusting the number of rows and the spread of multipliers—play it safe for steady returns or take a high-risk approach for massive rewards. With smooth gameplay, fair odds, and non-stop excitement, Plinko on Blockwinz keeps you on the edge of your seat. Drop the ball and see where luck takes you!',
        image: PlinkoImage,
        link: '/originals/plinko',
        id: GameTypeEnum.PlinkoGame,
        category: GameCategoryEnum.ORIGINALS,
        icon: PlinkoIcon,
    },
    [GameTypeEnum.WheelGame]: {
        name: 'Wheel',
        description: 'The Wheel on Blockwinz is a vibrant, fast-paced game where you spin a colorful wheel divided into segments with various multipliers. Place your bets on your lucky segment, spin the wheel, and watch the action unfold. Whether you play conservatively or aim for high multipliers, each spin offers a new chance to win big. With fun animations and instant outcomes, the Wheel delivers nonstop excitement with every round.',
        image: WheelImage,
        link: '/originals/wheel',
        id: GameTypeEnum.WheelGame,
        category: GameCategoryEnum.ORIGINALS,
        icon: WheelIcon,
    },
    [GameTypeEnum.CoinFlipGame]: {
        name: 'Coin Flip',
        description: 'Coin Flip on Blockwinz is the ultimate 50/50 game of chance. Simply choose heads or tails, place your bet, and flip the coin. It’s fast, fair, and perfect for players who love quick rounds and instant results. With a clean design and provably fair outcomes, Coin Flip brings simplicity and excitement together for a classic gambling experience. Ready to take the flip and double your money? Try your luck now!',
        image: CoinFlipImage,
        link: '/originals/coin-flip',
        comingSoon: true,
        id: GameTypeEnum.CoinFlipGame,
        category: GameCategoryEnum.ORIGINALS,
        icon: DiceIcon,
    },
    [GameTypeEnum.CrashGame]: {
        name: 'Crash',
        description: 'Crash on Blockwinz is an adrenaline-fueled game of timing and risk where the multiplier climbs higher and higher—until it suddenly crashes. Your goal? Cash out before the crash for a profit! Wait too long, and you lose it all. This high-stakes game challenges your nerve and instincts with every round. With customizable bets, auto-cashout options, and a fast-paced experience, Crash keeps players on their toes. How high will you go before you bail? Play Crash on Blockwinz and test your limits!',
        image: CrashImage,
        link: '/originals/crash',
        comingSoon: true,
        id: GameTypeEnum.CrashGame,
        category: GameCategoryEnum.ORIGINALS,
        icon: DiceIcon,
    },
    [GameTypeEnum.RouletteGame]: {
        name: 'Roulette',
        description: 'Roulette on Blockwinz brings the iconic casino wheel to your screen with sleek visuals and immersive sound. Bet on numbers, colors, or dozens, and watch the wheel spin in anticipation. With multiple betting options, strategic depth, and big payout potential, Roulette is a timeless classic that keeps you coming back for more. Whether you’re playing it safe on red or black, or going all-in on a lucky number, every spin is a thrill!',
        image: RouletteImage,
        link: '/originals/roulette',
        comingSoon: true,
        id: GameTypeEnum.RouletteGame,
        category: GameCategoryEnum.ORIGINALS,
        icon: DiceIcon,
    },
    [GameTypeEnum.BlackjackGame]: {
        name: 'Blackjack',
        description: 'Blackjack on Blockwinz is a stylish and strategic card game where you go head-to-head against the dealer. The objective is simple: get as close to 21 as possible without going over. Use logic, probability, and a bit of luck to make decisions like hit, stand, or double down. With smooth gameplay and real-time interaction, Blackjack delivers the full casino experience straight to your screen. Are you ready to beat the dealer?',
        image: BlackjackImage,
        link: '/originals/blackjack',
        comingSoon: true,
        id: GameTypeEnum.BlackjackGame,
        category: GameCategoryEnum.ORIGINALS,
        icon: DiceIcon,
    },
    [GameTypeEnum.BaccaratGame]: {
        name: 'Baccarat',
        description: `Baccarat on Blockwinz is a sophisticated card game of chance and strategy, popular among high-rollers and casual players alike. Bet on the Player, Banker, or a Tie, and let the cards decide the outcome. With its simple rules and low house edge, Baccarat offers big thrills and elegant gameplay. Whether you're a seasoned pro or new to the game, you'll love the tension and excitement of every draw.`,
        image: BaccaratImage,
        link: '/originals/baccarat',
        comingSoon: true,
        id: GameTypeEnum.BaccaratGame,
        category: GameCategoryEnum.ORIGINALS,
        icon: DiceIcon,
    },
    [GameTypeEnum.HiloGame]: {
        name: 'Hi-Lo',
        description: 'Hi-Lo on Blockwinz is a suspense-filled card game where you predict whether the next card will be higher or lower than the current one. Chain together multiple correct guesses for increasing multipliers and massive payouts. With a sleek interface and fast rounds, Hi-Lo blends luck and strategy into a captivating experience. How far can you go before the streak breaks? Play now and test your intuition!',
        image: HiloImage,
        link: '/originals/hilo',
        comingSoon: true,
        id: GameTypeEnum.HiloGame,
        category: GameCategoryEnum.ORIGINALS,
        icon: DiceIcon,
    }
};