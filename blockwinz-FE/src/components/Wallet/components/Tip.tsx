import { Box, Text } from '@chakra-ui/react';
import { FunctionComponent } from 'react';
import InfoIcon from '../../../assets/icons/info-icon.svg';

interface TipProps {}

const Tip: FunctionComponent<TipProps> = () => {
  return (
    <>
      <Box
        display={'flex'}
        alignItems={'center'}
        justifyContent={'center'}
        h={'100%'}
        mt={'64px'}>
        <img
          src={InfoIcon}
          alt='Buy Crypto Icon'
          style={{ width: '20px', height: '20px' }}
        />
        <Text textTransform={'uppercase'} ml={'8px'} fontSize={'lg'}>
          Coming Soon
        </Text>
      </Box>
    </>
  );
};

export default Tip;
