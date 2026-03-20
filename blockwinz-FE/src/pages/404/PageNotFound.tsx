import { Button } from '@/components/ui/button';
import { Box, Text } from '@chakra-ui/react';
import { FunctionComponent } from 'react';
import { useNavigate } from 'react-router-dom';

interface PageNotFoundProps {}

const PageNotFound: FunctionComponent<PageNotFoundProps> = () => {
  const navigate = useNavigate();

  return (
    <Box
      display={'flex'}
      flexDirection={'column'}
      justifyContent={'center'}
      alignItems={'center'}
      h={'60vh'}>
      <Text fontSize={'4xl'} fontWeight={'bold'}>
        404
      </Text>
      <Text fontSize={'2xl'} fontWeight={'bold'}>
        Page Not Found
      </Text>
      <Button
        mt={6}
        px={6}
        fontSize={'md'}
        color={'#151832'}
        bg={'#00DD25'}
        onClick={() => navigate('/')}>
        Back to Home
      </Button>
    </Box>
  );
};

export default PageNotFound;
