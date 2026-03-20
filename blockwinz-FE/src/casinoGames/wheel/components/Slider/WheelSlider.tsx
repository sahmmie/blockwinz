import { Box, Slider, Text } from '@chakra-ui/react'
import React from 'react'

interface WheelSliderProps {
  value: number
  onChange: (val: number) => void
  isDisabled: boolean
  trackBg?: string
}

const WheelSlider: React.FC<WheelSliderProps> = ({ value, onChange, isDisabled,trackBg = '#22223E' }) => {
  return (
    <Box width='100%'>
      <Text fontWeight={600} lineHeight={'1rem'} fontSize={'0.86rem'} color='white' mb={'8px'}>
        Segments
      </Text>
      <Box>
        <Slider.Root
          disabled={isDisabled}
          onChange={e =>
            onChange(parseInt((e.target as unknown as { value: string }).value))
          }
          value={[value]}
          min={10}
          step={10}
          max={50}>
          <Slider.Label />
          <Slider.ValueText />
          <Slider.Control>
            <Slider.Track bg={trackBg}>
              <Slider.Range />
            </Slider.Track>
            <Slider.Thumb index={0}>
              <Slider.HiddenInput />
            </Slider.Thumb>
            <Slider.MarkerGroup>
              <Slider.Marker value={value} />
            </Slider.MarkerGroup>
          </Slider.Control>
        </Slider.Root>
      </Box>
    </Box>
  )
}

export default WheelSlider
