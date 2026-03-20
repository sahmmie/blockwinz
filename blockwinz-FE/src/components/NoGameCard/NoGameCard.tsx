import { Box, Text } from '@chakra-ui/react';
import { FunctionComponent } from 'react';
import GameShowsIcon from '@/assets/icons/game-shows-icon.svg';

interface NoGameCardProps {}

const NoGameCard: FunctionComponent<NoGameCardProps> = () => {
  return (
    <Box
      borderRadius='0 0 16px 16px'
      mt='16px'
      h='488px'
      display='flex'
      flexDir='column'
      justifyContent='center'
      alignItems='center'
      bg='#151832'
      w='100%'>
      <img src={GameShowsIcon} alt='No Data Icon' style={{ width: '120px' }} />
      <Text fontWeight={600} fontSize='32px' lineHeight='48px' mt='24px'>
        No Game Available
      </Text>
    </Box>
  );
};

export default NoGameCard;
