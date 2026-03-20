import { Box, Text } from '@chakra-ui/react';
import { FunctionComponent } from 'react';

interface SegmentProps {
  options: Array<{ label: string; value: string }>;
  selected: string;
  setSelected?: (value: string) => void;
  bg?: string;
  padding?: string;
  borderRadius?: string;
}

const Segment: FunctionComponent<SegmentProps> = ({
  options,
  selected,
  setSelected,
  bg = '#000A27',
  padding = '10px',
  borderRadius = '8px',
}) => {
  return (
    <>
      <Box
        w={'100%'}
        display={'flex'}
        justifyContent={'center'}
        gap={{ base: '4px', md: '0px' }}
        bg={bg}
        borderRadius={borderRadius}
        padding={padding}>
        {options.map((option, index) => (
          <Box
            cursor={'pointer'}
            w={'100%'}
            key={index}
            borderRadius={'8px'}
            onClick={() => setSelected && setSelected(option.value)}
            bg={selected === option.value ? '#00DD25' : ''}
            color={selected === option.value ? '#151832' : 'inherit'}
            h={{ base: '40px', md: '48px' }}
            px={{ base: '4px', md: '0' }}
            display={'flex'}
            justifyContent={'center'}
            alignItems={'center'}>
            <Text
              fontSize={{ md: '18px', base: '16px' }}
              fontWeight={'500'}
              textWrap={'nowrap'}>
              {option.label}
            </Text>
          </Box>
        ))}
      </Box>
    </>
  );
};

export default Segment;
