import { FunctionComponent } from 'react';
import { Box, Button } from '@chakra-ui/react';
import NotificationsPopover from '../Notifications/NotificationPopover';
import ChatIcon from '../../assets/icons/chat-icon.svg';
import CoinStackIcon from '../../assets/icons/coin-stack.svg';
import UserIcon from '../../assets/icons/user-icon.svg';
import useChat from '@/hooks/useChat';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useNavigate } from 'react-router-dom';
import useAuth from '@/hooks/useAuth';
import useModal, { ModalProps } from '@/hooks/useModal';
import Authentication, { pagesT } from '@/pages/Auth/Authentication';

interface AuthNavProps {}

const AuthNav: FunctionComponent<AuthNavProps> = () => {
  const { setChatIsOpen, chatIsOpen } = useChat();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { openModal } = useModal();

  const navigateToProfile = () => {
    navigate('/profile');
  };

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

  const AuthMenu = () => {
    return (
      <Box
        gap={'12px'}
        w={'100%'}
        display={'flex'}
        alignItems={'center'}
        justifyContent={'end'}>
        <NotificationsPopover />

        {!isMobile && (
          <>
            <Box bg={'#FFFFFF'} height={'24px'} w={'1px'} />

            <Button unstyled cursor={'pointer'}>
              <img
                src={CoinStackIcon}
                alt='Coin stack icon'
                style={{ width: '26px', height: '24px' }}
              />
            </Button>
            <Box bg={'#FFFFFF'} height={'24px'} w={'1px'} />

            <Button
              unstyled
              onClick={() => setChatIsOpen(!chatIsOpen)}
              cursor={'pointer'}>
              <img
                src={ChatIcon}
                alt='Chat icon'
                style={{ width: '24px', height: '24px' }}
              />
            </Button>
            <Box bg={'#FFFFFF'} height={'24px'} w={'1px'} />
          </>
        )}

        <Button unstyled onClick={navigateToProfile} cursor={'pointer'}>
          <img
            src={UserIcon}
            alt='User icon'
            style={{ width: '24px', height: '27px' }}
          />
        </Button>
      </Box>
    );
  };

  const NoAuthMenu = () => {
    return (
      <Box display={'flex'} alignItems={'center'} gap={'20px'}>
        <Button
          bg={'#00DD25'}
          px={'32px'}
          onClick={() => openAuthenticationModal('signup')}>
          Sign Up
        </Button>
        <Button
          bg={'#545463'}
          px={'32px'}
          color={'#ECF0F1'}
          onClick={() => openAuthenticationModal('login')}>
          Login
        </Button>
      </Box>
    );
  };

  return (
    <>
      {isAuthenticated && <AuthMenu />}
      {!isAuthenticated && <NoAuthMenu />}
    </>
  );
};

export default AuthNav;
