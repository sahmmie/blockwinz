import { Box } from '@chakra-ui/react';
import { useCountUp } from 'use-count-up';
import { useEffect, useState } from 'react';
import useLimboState from '../hooks/useLimboState';
import { useLimboBox } from '../hooks/useLimboBox';

const LimboBox: React.FC = () => {
  const { displayValue, textColor, shouldAnimate } = useLimboBox();
  const { animSpeed } = useLimboState();
  const [isCounting, setIsCounting] = useState(false);

  const { value, reset } = useCountUp({
    isCounting: isCounting,
    start: 1.0,
    end: displayValue,
    duration: shouldAnimate ? animSpeed / 1000 : 0,
    easing: 'easeInCubic',
    decimalPlaces: 2,
    thousandsSeparator: '',
    decimalSeparator: '.',
    onComplete: () => {
      setIsCounting(false);
    },
  });

  useEffect(() => {
    setIsCounting(true);
    reset();
  }, [displayValue]);

  return (
    <Box
      display={'flex'}
      justifyContent={'center'}
      alignItems={'center'}
      w={{ base: '160px', md: '352px' }}
      h={{ base: '105px', md: '215px' }}
      border={'.2px solid #CBCCD1'}
      bg={'#060623'}
      borderRadius={'8px'}
      fontSize={{ base: '32px', md: '74px' }}
      fontWeight={{ base: '600', md: '700' }}
      lineHeight={{ base: '100%', md: '110px' }}
      color={textColor}
      textAlign={'center'}
      fontFeatureSettings={'tnum'}
      letterSpacing={'0.00em'}
      zIndex={1}>
      {value}
      <Box>x</Box>
    </Box>
  );
};

export default LimboBox;
