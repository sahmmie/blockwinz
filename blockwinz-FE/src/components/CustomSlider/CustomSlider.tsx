import { Box, Text } from '@chakra-ui/react';
import { Slider } from '@chakra-ui/react';
import React from 'react';

interface CustomSliderProps {
  label: string;
  value: number;
  onChange: (val: number) => void;
  isDisabled?: boolean;
  trackBg?: string;
  min?: number;
  max?: number;
  step?: number;
}

const CustomSlider: React.FC<CustomSliderProps> = ({
  label,
  value,
  onChange,
  isDisabled,
  trackBg = '#5C5C5C',
  min = 8,
  max = 16,
  step = 1,
}) => {
  return (
    <Box width='100%'>
      <Text fontWeight={600} fontSize={'14px'} color='white' mb={'8px'}>
        {label}
      </Text>
      <Box>
        <Slider.Root
          disabled={isDisabled}
          onValueChange={details => onChange(details.value[0])}
          value={[value]}
          min={min}
          max={max}
          step={step}>
          <Slider.Label />
          <Slider.ValueText />
          <Slider.Control>
            <Slider.Track bg={trackBg} height={'6px'}>
              <Slider.Range />
            </Slider.Track>
            <Slider.Thumb
              index={0}
              bg={'#ECF0F1'}
              border={'#00DD25 3px solid'}
              _active={{ bg: '#ECF0F1', border: '#00DD25 6px solid' }}>
              <Slider.HiddenInput />
            </Slider.Thumb>
            <Slider.MarkerGroup>
              <Slider.Marker value={value} />
            </Slider.MarkerGroup>
          </Slider.Control>
        </Slider.Root>
      </Box>
    </Box>
  );
};

export default CustomSlider;
