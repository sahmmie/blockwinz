import { FunctionComponent } from 'react';
import { Box, Text } from '@chakra-ui/react';
import TrendIcon from 'assets/icons/trend-icon.svg';
import { BET_STATUS, RiskLevel } from '../../types';
import { CurrencyInfo } from '@/shared/types/core';
import {
  DEFAULT_ROUNDING_DECIMALS,
} from '@/shared/constants/app.constant';

interface GameStatusModalProps {
  multiplier: RiskLevel;
  winAmount: number;
  betResultStatus: BET_STATUS;
  currency: CurrencyInfo;
}

const GameStatusModal: FunctionComponent<GameStatusModalProps> = ({
  multiplier,
  winAmount,
  betResultStatus,
  currency,
}) => {
  const ROUNDING_DECIMALS = currency.decimals || DEFAULT_ROUNDING_DECIMALS;
  const winColor = '#545463';
  const lossColor = '#393A48';

  const getColor = () => {
    if (betResultStatus === BET_STATUS.WIN) {
      return winColor;
    } else {
      return lossColor;
    }
  };

  const getTextTitle = () => {
    if (betResultStatus === BET_STATUS.WIN) {
      return 'Win!';
    } else if (betResultStatus === BET_STATUS.TIE) {
      return 'Tie!';
    } else {
      return 'Lose!';
    }
  };

  return (
    <>
      <Box
        h={'136px'}
        borderRadius={'8px'}
        display={'flex'}
        flexDir={'column'}
        alignItems={'center'}
        justifyContent={'center'}>
        <Box
          h={'100%'}
          alignItems={'center'}
          display={'flex'}
          w={'100%'}
          justifyContent={'center'}>
          <Text fontSize={'20px'} fontWeight={'500'} lineHeight={'30px'}>
            {getTextTitle()}
          </Text>
        </Box>
        <Box
          p={'4px'}
          display={'flex'}
          h={'100%'}
          alignItems={'center'}
          justifyContent={'space-evenly'}
          w={'100%'}>
          <Box
            bg={getColor()}
            w={'100%'}
            h={'100%'}
            borderBottomLeftRadius={'8px'}
            display={'flex'}
            alignItems={'center'}
            justifyContent={'center'}
            px={'12px'}>
            <img
              src={currency?.icon}
              alt='Currency Icon'
              style={{ width: '22px', height: '22px' }}
            />
            <Text
              fontSize={'18px'}
              fontWeight={'500'}
              lineHeight={'24px'}
              ml={'8px'}>
              {winAmount.toFixed(ROUNDING_DECIMALS)}
            </Text>
          </Box>
          <Box
            bg={getColor()}
            w={'100%'}
            h={'100%'}
            borderBottomRightRadius={'8px'}
            display={'flex'}
            alignItems={'center'}
            justifyContent={'flex-start'}
            px={'12px'}>
            <img
              src={TrendIcon}
              alt='Trend Icon'
              style={{ width: '22px', height: '20px' }}
            />
            <Text
              fontSize={'18px'}
              fontWeight={'500'}
              lineHeight={'24px'}
              ml={'8px'}>
              X{multiplier}
            </Text>
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default GameStatusModal;
