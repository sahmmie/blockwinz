import { getFormattedValue } from '@/shared/utils/common';
import { Box, Text } from '@chakra-ui/react';
import { FunctionComponent, useEffect, useRef } from 'react';
import ChanceIcon from '../../assets/icons/chance-icon.svg';
import MultiplierIcon from '../../assets/icons/multiplier-icon.svg';
import CustomInput from '../CustomInput/CustomInput';

interface MultiplierChanceInputProps {
  name: 'multiplier' | 'chance';
  value: string;
  setValue: (value: string) => void;
  disabled?: boolean;
  error?: string | undefined;
  selectTargetOnFocus?: boolean;
  handleBlur?: () => void;
  maxValue?: number;
}

const MultiplierChanceInput: FunctionComponent<MultiplierChanceInputProps> = ({
  name,
  value,
  setValue,
  disabled,
  error,
  handleBlur,
  selectTargetOnFocus = true,
  maxValue = Number.MAX_SAFE_INTEGER,
}) => {
  const prevValue = useRef(value);

  useEffect(() => {
    handleFormatValue(value as string);
  }, [value]);

  const handleFormatValue = (newValue: string) => {
    if (prevValue.current === newValue || !newValue) {
      return;
    }

    prevValue.current = newValue;
    const formattedValue = getFormattedValue({ value: newValue, maxValue });
    if (formattedValue !== newValue) {
      setValue(formattedValue);
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = getFormattedValue({ value: event.target.value });
    setValue(formattedValue);
  };

  const handleInputFocus = (event: React.FocusEvent<HTMLInputElement>) => {
    if (selectTargetOnFocus) {
      event.target.select();
    }
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
          mb={'-2px'}>
          <Box fontSize={'18px'} fontWeight={'500'} lineHeight={'30px'}>
            <Text>{name === 'multiplier' ? 'Multiplier' : 'Chance'}</Text>
          </Box>
        </Box>
      </>
    );
  };

  const endElement = () => {
      return (
        <>
          <Box>
            <img
              src={name === 'multiplier' ? MultiplierIcon : ChanceIcon}
              alt='Multiplier Icon'
              style={{ width: '20px', height: '20px' }}
            />
          </Box>
        </>
      );
  };

  return (
    <>
      <CustomInput
        name={name}
        type='number'
        value={value}
        disabled={disabled}
        onFocus={handleInputFocus}
        onChange={handleInputChange}
        onBlur={handleBlur}
        w={'100%'}
        fieldProps={{ label: label(), errorText: error }}
        inputGroupProps={{
          bg: '#423547',
          endElement: endElement(),
        }}
      />
    </>
  );
};

export default MultiplierChanceInput;
