import { Box, Text } from '@chakra-ui/react';
import React from 'react';
import { TbTriangleInvertedFilled } from 'react-icons/tb';
import { useDiceBoxPosition } from './useDiceBoxPosition';

interface DiceBoxProps {
  animSpeed: number;
  diceResult: number;
  successResult: boolean;
}

const DiceBox: React.FC<DiceBoxProps> = ({
  animSpeed,
  diceResult,
  successResult,
}) => {
  const { boxRef, animationStyles } = useDiceBoxPosition(diceResult, animSpeed);

  return (
    <Box
      ref={boxRef}
      position='absolute'
      width={{ base: '4.45rem', md: '5.45rem' }}
      height={{ base: '2.98rem', md: '3.81rem' }}
      bg='#151832'
      border='2px solid'
      borderColor={successResult ? '#00DD25' : '#F51B1BD9'}
      borderRadius='8px'
      display='flex'
      alignItems='center'
      justifyContent='center'
      zIndex={2}
      {...animationStyles}>
      <Box
        position='absolute'
        bottom='-10px'
        left='50%'
        transform='translateX(-50%)'
        color={successResult ? 'fixedColors.success' : 'fixedColors.error'}>
        <TbTriangleInvertedFilled size={'10px'} />
      </Box>
      <Text
        color='white'
        fontSize={'16px'}
        fontWeight={{ base: '600', md: '700' }}
        data-testid='dice-result'>
        {diceResult.toFixed(2)}
      </Text>
    </Box>
  );
};

export default DiceBox;
