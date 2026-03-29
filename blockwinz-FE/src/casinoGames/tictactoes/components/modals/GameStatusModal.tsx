import { FunctionComponent } from 'react';
import { Box, Text, Button } from '@chakra-ui/react';
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
  stakeAmount?: number;
  onRematch?: () => void;
  isRematchLoading?: boolean;
}

const GameStatusModal: FunctionComponent<GameStatusModalProps> = ({
  winAmount,
  betResultStatus,
  currency,
  stakeAmount = 0,
  onRematch,
  isRematchLoading = false,
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

  const handleRematchClick = (e: React.MouseEvent) => {
    // Stop propagation so we don't accidentally close the modal right away due to closeOnInteractInside
    e.stopPropagation();
    if (onRematch) {
      onRematch();
    }
  };

  return (
    <>
      <Box
        h={onRematch ? '200px' : '150px'}
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
          flexDir={'column'}
          justifyContent={'center'}>
          <Text fontSize={'20px'} fontWeight={'500'} lineHeight={'30px'} mt={'8px'}>
            {getTextTitle()}
          </Text>
        </Box>
        <Box w={'100%'} display={'flex'} flexDir={'column'} gap={'4px'} px={'4px'} pb={'4px'}>
          <Box
            display={'flex'}
            h={'40px'}
            alignItems={'center'}
            justifyContent={'space-between'}
            w={'100%'}
            bg={getColor()}
            px={'12px'}
            borderRadius={'4px'}>
            <Text fontSize={'14px'} fontWeight={'600'} color={'#A0A0B0'}>Stake</Text>
            <Box display={'flex'} alignItems={'center'}>
              <Text fontSize={'16px'} fontWeight={'500'} mr={'6px'}>
                {stakeAmount.toFixed(ROUNDING_DECIMALS)}
              </Text>
              <img src={currency?.icon} alt='Currency Icon' style={{ width: '18px', height: '18px' }} />
            </Box>
          </Box>
          <Box
            display={'flex'}
            h={'40px'}
            alignItems={'center'}
            justifyContent={'space-between'}
            w={'100%'}
            bg={getColor()}
            px={'12px'}
            borderRadius={'4px'}>
            <Text fontSize={'14px'} fontWeight={'600'} color={'#A0A0B0'}>Payout</Text>
            <Box display={'flex'} alignItems={'center'}>
              <Text fontSize={'16px'} fontWeight={'500'} mr={'6px'}>
                {winAmount.toFixed(ROUNDING_DECIMALS)}
              </Text>
              <img src={currency?.icon} alt='Currency Icon' style={{ width: '18px', height: '18px' }} />
            </Box>
          </Box>
          {onRematch && (
            <Button
              mt={'8px'}
              w={'100%'}
              h={'40px'}
              bg={'#00DD25'}
              color={'black'}
              _hover={{ bg: '#00B01D' }}
              onClick={handleRematchClick}
              loading={isRematchLoading}
            >
              Rematch
            </Button>
          )}
        </Box>
      </Box>
    </>
  );
};

export default GameStatusModal;
