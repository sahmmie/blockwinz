import React from 'react';
import { Box, Image } from '@chakra-ui/react';
import gold from '../../assets/gold.png';
import silver from '../../assets/silver.png';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/useIsMobile';

interface CoinTypeToggleProps {
  selectedCoinType: number;
  onChange: (coinType: number) => void;
  isDisabled?: boolean;
}

const goldClr = '#ffce1d';
const silverClr = '#d4d4d4';

const CoinTypeToggle: React.FC<CoinTypeToggleProps> = ({
  selectedCoinType,
  onChange,
  isDisabled = false,
}) => {
  const isMobile = useIsMobile();
  const w = isMobile ? '60%' : '150%';

  return (
    <Box display='flex' justifyContent='center' gap='16px' h='64px'>
      <Button
        flex={1}
        h='100%'
        onClick={() => onChange(0)}
        disabled={isDisabled}
        bg='transparent'
        _hover={{ bg: 'button.bg' }}
        borderRadius='md'
        border={selectedCoinType === 0 ? '2px solid' : undefined}
        borderColor={selectedCoinType === 0 ? goldClr : 'transparent'}
        boxShadow={selectedCoinType === 0 ? '0 0 10px #FFAE0099' : 'none'}
        p={2}
      >
        <Image
          src={gold}
          alt='Gold'
          w={w}
          maxW={w}
          pointerEvents='none'
          draggable={false}
        />
      </Button>
      <Button
        flex={1}
        h='100%'
        onClick={() => onChange(1)}
        disabled={isDisabled}
        bg='transparent'
        _hover={{ bg: 'button.bg' }}
        borderRadius='md'
        border={selectedCoinType === 1 ? '2px solid' : undefined}
        borderColor={selectedCoinType === 1 ? silverClr : 'transparent'}
        boxShadow={selectedCoinType === 1 ? '0 0 10px #C0C0C099' : 'none'}
        p={2}
      >
        <Image
          src={silver}
          alt='Silver'
          w={w}
          maxW={w}
          pointerEvents='none'
          draggable={false}
        />
      </Button>
    </Box>
  );
};

export default CoinTypeToggle;
