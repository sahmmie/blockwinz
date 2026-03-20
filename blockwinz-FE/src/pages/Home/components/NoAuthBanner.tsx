import useModal, { ModalProps } from '@/hooks/useModal';
import Authentication, { pagesT } from '@/pages/Auth/Authentication';
import { Box, Button, Text } from '@chakra-ui/react';
import { FunctionComponent } from 'react';
import homeIllustration from '@/assets/icons/home-illustration.png';

interface NoAuthBannerProps {}

const NoAuthBanner: FunctionComponent<NoAuthBannerProps> = () => {
  const { openModal } = useModal();

  const openAuthenticationModal = (page: pagesT) => {
    const modalConfig: ModalProps = {
      size: 'xl',
      hideCloseButton: false,
      hideHeader: true,
      width: { base: '90%', md: 'full' },
      backgroundColor: '#000A27',
      height: '840px',
      autoCloseAfter: 0,
      backdrop: true,
      scrollBehavior: 'inside',
    };
    openModal(<Authentication activePage={page} />, undefined, modalConfig);
  };

  return (
    <>
      <Box
        pt={{ base: '16px', md: '34px' }}
        pb={{ base: '16px', md: '0' }}
        pl={'16px'}
        w={'100%'}
        h={'100%'}
        display={'flex'}
        flexDir={'column'}
        width={'6/12'}
        gap={{ base: '8px', md: '18px' }}>
        <Text
          fontWeight={{ base: '700', md: '800' }}
          fontSize={{ base: '22px', md: '48px' }}>
          Every Game is a Blockbuster!
        </Text>
        <Text fontSize={{ base: '16px', md: '22px' }}>
          Get Up To 100% bonus and <br /> win $5000 weekly!
        </Text>
        <Button
          onClick={() => openAuthenticationModal('login')}
          bg={'#00DD25'}
          color={'#151832'}
          size={{ base: 'md', md: 'lg' }}
          w={'fit-content'}>
          Claim Now
        </Button>
      </Box>
      <Box
        w={'6/12'}
        style={{
          backgroundImage: `url(${homeIllustration})`,
          borderRadius: '8px',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'top',
        }}>
      </Box>
    </>
  );
};

export default NoAuthBanner;
