import { GameInfo } from '@/shared/types/types';
import { Box, Text } from '@chakra-ui/react';
import { FunctionComponent } from 'react';
import { useNavigate } from 'react-router-dom';

interface GameCardProps {
  game: GameInfo;
}

const GameCard: FunctionComponent<GameCardProps> = ({ game }) => {
  const navigate = useNavigate();
  const navigateToGame = (path: string) => {
    if (!game.comingSoon) {
      navigate(path);
    }
  };
  const renderComingSoon = (): JSX.Element => {
    if (game?.comingSoon) {
      return (
        <Box
          p={'8px'}
          mt={'8px'}
          borderRadius={'8px 0px 0px 8px'}
          bg={'#55627B73'}
          position={'absolute'}
          w={'fit-content'}
          top={0}
          right={0}>
          <Text fontSize={'12px'} fontWeight={'600'} lineHeight={'24px'}>
            Coming Soon
          </Text>
        </Box>
      );
    }
    return <></>;
  };

  return (
    <Box
      aspectRatio={.8}
      w='100%'
      overflow='hidden'
      position={'relative'}
      onClick={() => navigateToGame(game.link)}
      cursor={'pointer'}
      transition='transform 0.1s ease-in-out'
      _hover={{ transform: 'scale(0.95)' }}>
      <img
        draggable={false}
        src={game.image}
        alt='Game Image'
        style={{ width: '100%', height: '100%' }}
      />
      {renderComingSoon()}
    </Box>
  );
};

export default GameCard;
