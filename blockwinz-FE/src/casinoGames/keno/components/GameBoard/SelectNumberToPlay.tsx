import { Text, Box, useBreakpointValue } from '@chakra-ui/react';

export const SelectNumbersToPlay = () => {
  const isMobile = useBreakpointValue({ base: true, lg: false, md: false });

  return (
    <Box
      maxW={'756px'}
      width='100%'
      height='60px'
      borderRadius='8px'
      display='flex'
      alignItems='center'
      justifyContent='center'
      bg='#545463'>
      <Text
        color='#FFFFFF'
        fontWeight='400'
        lineHeight={'40px'}
        textAlign='center'
        fontSize={isMobile ? '0.85rem' : '20px'}>
        Select 1 - 10 numbers to play
      </Text>
    </Box>
  );
};
