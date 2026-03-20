import React, { useEffect, useState } from 'react';
import { Box, Flex, Image } from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { BsPercent } from 'react-icons/bs';
import { useGameControlsContext } from '../../hooks/gameControlsContext';
import useWalletState from '@/hooks/useWalletState';
import { useIsMobile } from '@/hooks/useIsMobile';
import { plinkoMuls } from '@/casinoGames/plinko/plinkoMuls';
import CustomInput from '@/components/CustomInput/CustomInput';
import { currencyIconMap } from '@/shared/utils/gameMaps';

interface HoverInfoProps {
  bucketIndex: number;
}

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const fadeOut = keyframes`
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(-10px);
  }
`;

const fadeInMob = keyframes`
  from {
    opacity: 0;
    transform: scale(0.5) translateY(-2px);
  }
  to {
    opacity: 1;
    transform: scale(0.5) translateY(0);
  }
`;

const fadeOutMob = keyframes`
  from {
    opacity: 1;
    transform: scale(0.5) translateY(0);
  }
  to {
    opacity: 0;
    transform: scale(0.5) translateY(-2px);
  }
`;

const HoverInfo: React.FC<HoverInfoProps> = ({ bucketIndex }) => {
  const { betAmount, risk, rows } = useGameControlsContext();
  const {
    selectedBalance: { currency },
  } = useWalletState();
  const isMobile = useIsMobile();

  const [isVisible, setIsVisible] = useState(true);

  const multiplier = plinkoMuls[risk][rows][bucketIndex] || 0;
  const bA = parseFloat(betAmount);
  const profit = multiplier * bA - bA;
  const combinations = binomialCoefficient(rows, bucketIndex);
  const totalPaths = Math.pow(2, rows);
  const chance = ((combinations / totalPaths) * 100).toFixed(6);

  const fi = isMobile ? fadeInMob : fadeIn;
  const fo = isMobile ? fadeOutMob : fadeOut;

  const scl = isMobile ? 0.5 : 1;
  useEffect(() => {
    setIsVisible(true);
    return () => {
      setIsVisible(false);
    };
  }, []);

  return (
    <Box
      position='absolute'
      top={isMobile ? '-70px' : '-80px'}
      zIndex={10}
      border='1px solid'
      borderColor={'#00DD25'}
      borderRadius='lg'
      padding='8px'
      minWidth='500px'
      textAlign='center'
      animation={`${isVisible ? fi : fo} 0.5s`}
      transform={`scale(${scl})`}>
      <Flex gap={4} direction='row' alignItems='center' justifyContent='center'>
        <CustomInput
          readOnly
          title='Profit'
          value={profit.toFixed(2)}
          inputGroupProps={{
            endElement: (
              <Box>
                <Image
                  src={currencyIconMap[currency]}
                  alt='currency'
                  width={'16px'}
                  height={'16px'}
                />
              </Box>
            ),
          }}
        />
        <CustomInput
          readOnly
          title='Chance'
          value={`${chance}%`}
          inputGroupProps={{
            endElement: (
              <Box>
                <BsPercent color='#FFFFFF' />
              </Box>
            ),
          }}
        />
      </Flex>
    </Box>
  );
};

export default HoverInfo;

function binomialCoefficient(n: number, k: number): number {
  if (k < 0 || k > n) return 0;
  if (k === 0 || k === n) return 1;
  k = Math.min(k, n - k);
  let result = 1;
  for (let i = 1; i <= k; i++) {
    result *= n - (k - i);
    result /= i;
  }
  return result;
}
