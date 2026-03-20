import { Slider as ChakraSlider, For, Box } from '@chakra-ui/react';
import * as React from 'react';
import { TbTriangleInvertedFilled } from 'react-icons/tb';
import bwIcon from '../../assets/bw.svg';
export interface SliderProps extends ChakraSlider.RootProps {
  isRollOver?: boolean;
}

const marksProp = [
  { value: 0, label: '0' },
  { value: 25, label: '25' },
  { value: 50, label: '50' },
  { value: 75, label: '75' },
  { value: 100, label: '100' },
];

const DiceSlider = React.forwardRef<HTMLDivElement, SliderProps>(
  function Slider(props, ref) {
    const { isRollOver, ...rest } = props;
    const value = props.defaultValue ?? props.value;
    const isRollOverValue = isRollOver ?? true;

    const marks = marksProp?.map(mark => {
      if (typeof mark === 'number') return { value: mark, label: undefined };
      return mark;
    });

    const hasMarkLabel = !!marks?.some(mark => mark.label);

    return (
      <ChakraSlider.Root
        ref={ref}
        thumbAlignment='center'
        {...rest}
        size={'lg'}
        width={'100%'}
        border={'8px solid #4A445A99'}
        borderRadius={'8px'}
        paddingX={'30px'}
        pt={'20px'}
        pb={'8px'}
        position={'relative'}>
        <ChakraSlider.Control data-has-mark-label={hasMarkLabel || undefined}>
          <ChakraSlider.Track bg={isRollOverValue ? '#00DD25' : '#F51B1BD9'}>
            <ChakraSlider.Range bg={isRollOverValue ? '#F51B1BD9' : '#00DD25'} />
          </ChakraSlider.Track>
          <SliderThumbs value={value} />
          <Box position={'absolute'} top={'44px'} left={'0'} right={'0'}>
            <SliderMarks marks={marks} />
          </Box>
        </ChakraSlider.Control>
      </ChakraSlider.Root>
    );
  },
);

function SliderThumbs(props: { value?: number[] }) {
  const { value } = props;
  return (
    <For each={value}>
      {(_, index) => (
        <ChakraSlider.Thumb
          key={index}
          index={index}
          w={'24px'}
          h={'40px'}
          bg={'#545463'}
          outline='none'
          _focus={{ boxShadow: 'none' }}
          _active={{ boxShadow: 'none' }}>
          <ChakraSlider.HiddenInput />
          <img src={bwIcon} alt='' draggable={false} />
        </ChakraSlider.Thumb>
      )}
    </For>
  );
}

interface SliderMarksProps {
  marks?: Array<number | { value: number; label: React.ReactNode }>;
}

const SliderMarks = React.forwardRef<HTMLDivElement, SliderMarksProps>(
  function SliderMarks(props, ref) {
    const { marks } = props;
    if (!marks?.length) return null;

    return (
      <ChakraSlider.MarkerGroup ref={ref}>
        {marks.map((mark, index) => {
          const value = typeof mark === 'number' ? mark : mark.value;
          const label = typeof mark === 'number' ? undefined : mark.label;
          return (
            <ChakraSlider.Marker
              key={index}
              value={value}
              color={'#ECF0F1'}
              fontSize={'16px'}
              lineHeight={'18px'}
              fontWeight={'500'}>
              <TbTriangleInvertedFilled
                color='#4A445A99'
                style={{ width: '14px', height: '14px', marginBottom: '-8px' }}
              />
              {label}
            </ChakraSlider.Marker>
          );
        })}
      </ChakraSlider.MarkerGroup>
    );
  },
);

export default DiceSlider;
