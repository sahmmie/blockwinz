import { FunctionComponent } from 'react';
import { Box, Text } from '@chakra-ui/react';
import { Currency } from '@/shared/enums/currency.enum';
import { currencyIconMap } from '@/shared/utils/gameMaps';
import { ModalProps } from '@/hooks/useModal';
import { DEFAULT_ROUNDING_DECIMALS } from '@/shared/constants/app.constant';
import useWalletState from '@/hooks/useWalletState';

export interface GameStatusModalProps {
  title: string;
  currency: Currency;
  winAmount: number;
  rightText?: string;
  rightIcon?: string;
}

export const modalConfig: ModalProps = {
  size: 'xs',
  hideCloseButton: true,
  hideHeader: true,
  width: '200px',
  backgroundColor: '#00DD25',
  autoCloseAfter: 0,
  top: { base: '0', md: '-8%' },
  left: { base: '0', md: 20 },
  closeOnInteractInside: true,
  backdrop: true,
};

const GameStatusModal: FunctionComponent<GameStatusModalProps> = ({
  winAmount,
  currency,
  rightText,
  rightIcon,
  title,
}) => {
  const { balances } = useWalletState();
  const ROUNDING_DECIMALS =
    balances.find(c => c.currency === currency)?.decimals ||
    DEFAULT_ROUNDING_DECIMALS;
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
          <Text fontSize={'24px'} fontWeight={'600'} lineHeight={'32px'}>
            {title}
          </Text>
        </Box>
        <Box
          p={'4px'}
          display={'flex'}
          h={'100%'}
          alignItems={'center'}
          justifyContent={'space-between'}
          w={'100%'}>
          <Box
            bg={'#545463'}
            w={'100%'}
            h={'100%'}
            borderBottomLeftRadius={'8px'}
            display={'flex'}
            alignItems={'center'}
            justifyContent={'center'}
            px={'20px'}>
            <img
              src={currencyIconMap[currency]}
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
            bg={'#545463'}
            w={'100%'}
            h={'100%'}
            borderBottomRightRadius={'8px'}
            display={'flex'}
            alignItems={'center'}
            justifyContent={'flex-start'}
            px={'12px'}>
            <img
              src={rightIcon}
              alt='Right Icon'
              style={{ width: '26px', height: '26px' }}
            />
            <Text
              fontSize={'18px'}
              fontWeight={'500'}
              lineHeight={'24px'}
              ml={'4px'}>
              {rightText}
            </Text>
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default GameStatusModal;
