import { FunctionComponent } from 'react';
import { Box, Text } from '@chakra-ui/react';
import { useTictactoeGameContext } from '../context/TictactoeGameContext';
import TictactoeBox from './TictactoeBox';

interface GameBoardProps {}

const GameBoard: FunctionComponent<GameBoardProps> = () => {
  const {
    state: { userIs, aiIs },
    opponentLabel,
  } = useTictactoeGameContext();

  const usersList = [
    {
      label: 'You',
      value: 'you',
      color: '#E566FF',
      bg: '#5454638C',
      userIs: userIs,
    },
    {
      label: opponentLabel,
      value: 'opponent',
      color: '#FFFFFF',
      bg: '#5454638C',
      userIs: aiIs,
    },
  ];

  return (
    <Box
      display={'flex'}
      flexDirection={'column'}
      alignItems={'center'}
      pt={'16px'}
      justifyContent={'center'}
      h={'100%'}>
      <Box
        h={'100%'}
        display={'flex'}
        justifyContent={'center'}
        alignItems={'center'}
        p={{ base: '16px', md: '72px' }}>
        <TictactoeBox />
      </Box>

      <Box
        px={{
          base: '16px',
          md: '0',
        }}
        w={'100%'}
        display={'flex'}
        justifyContent={{ base: 'center', md: 'center' }}
        gap={{ base: '48px', md: '120px' }}>
        {usersList.map((user, index) => (
          <Box
            key={index}
            border={'0.2px solid #CBCCD1'}
            borderTopRadius={'8px'}
            bg={user.bg}
            width={{ base: '104px', md: '164px' }}
            pt={'10px'}
            textAlign={'center'}
            color={user.color}>
            <Text
              fontSize={{ base: '20px', md: '36px' }}
              fontWeight={{ base: '500', md: '600' }}
              lineHeight={{ base: '20px', md: '28px' }}
              mb={'4px'}>
              {user.userIs}
            </Text>
            <Text
              pb={'10px'}
              fontSize={{ base: '16px', md: '20px' }}
              lineHeight={{ base: '20px', md: '28px' }}
              fontWeight={'500'}>
              {user.label}
            </Text>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default GameBoard;
