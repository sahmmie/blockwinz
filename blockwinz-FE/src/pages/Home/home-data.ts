import BwIcon from '@/assets/bw-icon-only.svg';
import GreenFireIcon from '@/assets/icons/green-fire-icon.svg';
import NewReleasesIcon from '@/assets/icons/new-releases-icon.svg';
import MultiplayerIcon from '@/assets/icons/multiplayer-icon.svg';
import LiveCasinoIcon from '@/assets/icons/live-casino-icon.svg';
import BonusImg from '@/assets/icons/bonus-image.png';
import GameImg from '@/assets/icons/game-image.png';

// Cards to show
export const cards = [
    {
        image: GameImg,
        title: 'Every Game is \na Blockbuster!',
        description: 'Play with excitement, \nWin with Ease',
        buttonText: 'Play Now',
        actionType: 'navigate-new-releases', // Add actionType instead
    },
    {
        image: BonusImg,
        title: '100% Weekly \nBonus',
        description: 'Get up to $300 Bonus and \ncoupons weekly on Blockwinz',
        buttonText: 'Claim Bonus',
        actionType: 'claim-bonus', // Add actionType instead
    },
];


export const buttons: { label: string; value: string; icon: string }[] = [
    { label: 'Blockwinz Originals', value: 'originals', icon: BwIcon },
    { label: 'Popular', value: 'popular', icon: GreenFireIcon },
    {
        label: 'New Releases',
        value: 'new-releases',
        icon: NewReleasesIcon,
    },
    { label: 'Multiplayer', value: 'multiplayer', icon: MultiplayerIcon },
    { label: 'Live Games', value: 'live', icon: LiveCasinoIcon },
];