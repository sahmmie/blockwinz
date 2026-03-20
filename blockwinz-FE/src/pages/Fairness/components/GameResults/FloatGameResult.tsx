import React from 'react';
import { Box, Text } from '@chakra-ui/react';

interface FloatGameResultProps {
  result?: number;
}

const FloatGameResult: React.FC<FloatGameResultProps> = ({ result = 0 }) => {
  return (
    <Box
      width={'100%'}
      height={'100px'}
      borderRadius={'md'}
      bg={'#151832'}
      display={'flex'}
      alignItems={'center'}
      justifyContent={'center'}>
      {
        <Text fontSize={'2.8rem'} fontWeight={'600'} lineHeight={'40px'}>
          {result.toFixed(2)}
        </Text>
      }
    </Box>
  );
};

export default FloatGameResult;
