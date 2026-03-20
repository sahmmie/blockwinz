import { GameInfo } from '@/shared/types/types';
import { Box } from '@chakra-ui/react';
import { FunctionComponent } from 'react';
import GameCard from '../GameCard/GameCard';

interface GameCardProps {
  games: GameInfo[];
}

const GameCardList: FunctionComponent<GameCardProps> = ({ games }) => {
  return (
    <Box
      mt={'16px'}
      bg={'#151832'}
      borderRadius={'8px 8px 16px 16px'}
      w={'100%'}
      display={'grid'}
      gridTemplateColumns={{
        base: 'repeat(2, 1fr)', // base devices
        md: 'repeat(3, 1fr)', // tablets
        lg: 'repeat(4, 1fr)', // small desktops
        xl: 'repeat(6, 1fr)', // large screens
      }}
      gap={'16px'}
      py={{ base: '20px', md: '24px' }}
      px={{ base: '12px', md: '16px' }}>
      {games.map((game: GameInfo, index: number) => (
        <GameCard key={index} game={game} />
      ))}
    </Box>
  );
};

export default GameCardList;
