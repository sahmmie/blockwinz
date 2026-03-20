import { FunctionComponent } from 'react';
import CustomInput from '../CustomInput/CustomInput';
import { Box, Text } from '@chakra-ui/react';
import useWalletState from '@/hooks/useWalletState';
import { Currency } from '@/shared/enums/currency.enum';
import { currencyIconMap } from '@/shared/utils/gameMaps';

interface ProfitOnWinProps {
  value: string;
  error?: string | undefined;
  currency?: Currency;
}

const ProfitOnWin: FunctionComponent<ProfitOnWinProps> = ({
  value,
  error,
  currency,
}) => {
  const { selectedBalance } = useWalletState();

  const startElement = () => {
    return (
      <>
        <Box>
          <img
            src={currency ? currencyIconMap[currency] : selectedBalance?.icon}
            alt='Currency Icon'
            style={{ width: '22px', height: '22px' }}
          />
        </Box>
      </>
    );
  };

  const label = (): JSX.Element => {
    return (
      <>
        <Box
          w={'100%'}
          display={'flex'}
          justifyContent={'space-between'}
          alignItems={'center'}
          color={'#D9D9D9'}
          mb={'2px'}>
          <Box fontSize={'14px'} fontWeight={'500'}>
            <Text>Profit On Win</Text>
          </Box>
        </Box>
      </>
    );
  };

  const endElement = () => {
    return (
      <>
        <Box fontSize={'14px'} fontWeight={'500'} color={'#D9D9D9'}>
          <Text>
            {currency
              ? currency.toUpperCase()
              : selectedBalance?.currency.toUpperCase()} {' '}
            {isNaN(parseFloat(value)) ? '0.00' : value}
          </Text>
        </Box>
      </>
    );
  };

  return (
    <>
      <CustomInput
        disabled
        type='number'
        value={value}
        fieldProps={{ label: label(), errorText: error }}
        inputGroupProps={{
          startElement: startElement(),
          endElement: endElement(),
        }}
      />
    </>
  );
};

export default ProfitOnWin;
