import useWalletState from '@/hooks/useWalletState';
import { getCurrencyMax, parseFloatValue } from '@/shared/utils/common';
import { Box, Text } from '@chakra-ui/react';
import { FunctionComponent, useEffect, useState } from 'react';
import CustomInput from '../CustomInput/CustomInput';
import { Button } from '../ui/button';
import { Currency } from '@/shared/enums/currency.enum';
import { DEFAULT_ROUNDING_DECIMALS } from '@/shared/constants/app.constant';
import { currencyIconMap } from '@/shared/utils/gameMaps';

interface BetAmountProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  error?: string | undefined;
  currency?: Currency;
}

const BetAmount: FunctionComponent<BetAmountProps> = ({
  value,
  onChange,
  disabled,
  error,
  currency,
}) => {
  const { selectedBalance } = useWalletState();
  const ROUNDING_DECIMALS =
    selectedBalance?.decimals || DEFAULT_ROUNDING_DECIMALS;
  const [inputValue, setInputValue] = useState<string>(
    value.toFixed(ROUNDING_DECIMALS),
  );
  const maxVal = Math.min(
    selectedBalance?.availableBalance || 0,
    getCurrencyMax(selectedBalance?.currency as Currency, 'bet'),
  );

  const maxBetAmount = getCurrencyMax(
    selectedBalance?.currency as Currency,
    'bet',
  );

  const clampToMax = (val: number) => Math.min(val, maxBetAmount);

  const handleOnChange = (inputValue: string) => {
    if (disabled) return;
    setInputValue(inputValue);
    const newValue = clampToMax(parseFloat(inputValue) || 0);
    onChange(newValue);
  };

  const handleOnHalf = () => {
    if (disabled) return;
    const newValue = parseFloatValue(value / 2, ROUNDING_DECIMALS);
    setInputValue(newValue.toFixed(ROUNDING_DECIMALS));
    onChange(newValue);
  };

  const handleOnDouble = () => {
    if (disabled) return;
    const startValue = 1 / Math.pow(10, ROUNDING_DECIMALS);
    let val = value === 0 ? startValue : value * 2;
    if (maxVal) {
      val = Math.min(maxVal, val);
    }
    const newValue = parseFloatValue(val, ROUNDING_DECIMALS);
    setInputValue(newValue.toFixed(ROUNDING_DECIMALS));
    onChange(newValue);
  };

  const handleOnBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    const inputValue = event.target.value;
    const newValue = clampToMax(parseFloatValue(inputValue, ROUNDING_DECIMALS));
    setInputValue(newValue.toFixed(ROUNDING_DECIMALS));
    onChange(newValue);
  };

  const handleOnFocus = (event: React.FocusEvent<HTMLInputElement>) => {
    event.target.select();
  };

  useEffect(() => {
    const valueAsFloat = parseFloat(value.toFixed(ROUNDING_DECIMALS));
    const inputValueAsFloat = parseFloat(inputValue);
    if (Math.abs(valueAsFloat - inputValueAsFloat) > 0.0001) {
      setInputValue(value.toFixed(ROUNDING_DECIMALS));
    }
  }, [value, inputValue]);

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
            <Text>Bet Amount</Text>
          </Box>
          <Box fontSize={'14px'} fontWeight={'500'} mr={'14px'}>
            <Text>
              {currency
                ? currency.toUpperCase()
                : selectedBalance?.currency.toUpperCase()}{' '}
              {isNaN(parseFloat(value.toFixed(ROUNDING_DECIMALS)))
                ? '0.00'
                : value.toFixed(ROUNDING_DECIMALS)}
            </Text>
          </Box>
        </Box>
      </>
    );
  };

  const startElement = (icon: string) => {
    return (
      <>
        <Box>
          <img
            src={icon}
            alt='Currency Icon'
            style={{ width: '22px', height: '22px' }}
          />
        </Box>
      </>
    );
  };

  const endElement = () => {
    return (
      <>
        <Box display={'flex'} alignItems={'center'} justifyContent={'center'}>
          <Button
            disabled={disabled}
            onClick={handleOnHalf}
            mr={'6px'}
            px={'0px'}
            py={'0px'}
            bg={'rgba(78, 77, 101, 0.64)'}
            color={'#FFFFFF'}
            borderRadius={'8px'}>
            ½
          </Button>
          <Button
            disabled={disabled}
            onClick={handleOnDouble}
            mr={'0px'}
            px={'0px'}
            py={'0px'}
            bg={'rgba(78, 77, 101, 0.64)'}
            color={'#FFFFFF'}
            borderRadius={'8px'}>
            2X
          </Button>
        </Box>
      </>
    );
  };

  return (
    <Box>
      <CustomInput
        disabled={disabled}
        type='number'
        value={inputValue}
        max={maxVal}
        onBlur={handleOnBlur}
        onFocus={handleOnFocus}
        onChange={e => handleOnChange(e.target.value)}
        fieldProps={{ label: label(), errorText: error }}
        inputGroupProps={{
          startElement: startElement(
            currency ? currencyIconMap[currency] : selectedBalance?.icon,
          ),
          endElement: endElement(),
        }}
      />
    </Box>
  );
};

export default BetAmount;
