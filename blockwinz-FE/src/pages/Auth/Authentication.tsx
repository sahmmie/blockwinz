/* eslint-disable no-constant-binary-expression */
import { Box, Text } from '@chakra-ui/react';
import { FunctionComponent, useState, lazy, Suspense, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import GoogleIcon from '@/assets/icons/google-icon.svg';
import XIcon from '@/assets/icons/x-icon.svg';
import BlockwinLogo from '@/assets/bw-logo-with-title-white.png';
import ProgressSpinner from '@/components/ProgressSpinner/ProgressSpinner';
import ResetPassword from './ResetPasswored';

const Signup = lazy(() => import('./Signup'));
const Login = lazy(() => import('./Login'));

export type pagesT = 'signup' | 'login' | 'resetPassword';

interface AuthenticationProps {
  activePage?: pagesT;
}

const Authentication: FunctionComponent<AuthenticationProps> = ({
  activePage,
}) => {
  const [activeTab, setActiveTab] = useState<pagesT>('login');

  const activeStyles = {
    borderBottom: '4px solid #00DD25',
    borderRadius: '2px',
  };

  const isPathActive = (path: pagesT) => activeTab === path;

  const handleNavigation = (path: pagesT) => {
    setActiveTab(path);
  };

  useEffect(() => {
    if (activePage) {
      setActiveTab(activePage);
    }
  }, [activePage]);

  const socialAuth = () => {
    return (
      <Box>
        <Box
          display={'flex'}
          mt={'28px'}
          mb={'30px'}
          w={'100%'}
          justifyContent={'center'}
          alignItems={'center'}>
          <Box>
            <Text fontSize={'18px'} lineHeight={'27px'} fontWeight={'500'}>
              Or continue with
            </Text>
          </Box>
        </Box>

        <Box display={'flex'} w={'100%'} justifyContent={'center'} gap={'14px'}>
          <Suspense fallback={<div>Loading...</div>}>
            <Button
              py={'22px'}
              px={'20px'}
              bg={'#151832'}
              color={'#FFFFFF'}
              fontSize={'20px'}
              fontWeight={'500'}
              lineHeight={'30px'}>
              <img
                src={GoogleIcon}
                alt='Google Icon'
                style={{ width: '24px', height: '24px' }}
              />
              Google
            </Button>
            <Button
              py={'22px'}
              px={'20px'}
              bg={'#151832'}
              color={'#FFFFFF'}
              fontSize={'20px'}
              fontWeight={'500'}
              lineHeight={'30px'}>
              <img
                src={XIcon}
                alt='X Icon'
                style={{ width: '24px', height: '24px' }}
              />
              X
            </Button>
          </Suspense>
        </Box>
      </Box>
    );
  };

  return (
    <Box w={'100%'} display={'flex'} flexDirection={'row'} flex={1}>
      <Box
        h={'840px'}
        px={'16px'}
        display={{ base: 'none', md: 'flex' }}
        justifyContent={'center'}
        alignItems={'center'}
        w={'6/12'}
        bg={'rgba(21, 24, 50, 1)'}
        backdropBlur={'4px'}
        backdropFilter={'4px'}
        opacity={'80%'}
        alignSelf='stretch'>
        <Suspense fallback={<ProgressSpinner />}>
          <img
            src={BlockwinLogo}
            alt={'Blockwinz Logo'}
            style={{ width: '300px', height: '300px', objectFit: 'contain' }}
          />
        </Suspense>
      </Box>
      <Box
        w={{ base: '100%', md: '50%' }}
        display={'flex'}
        alignItems={'center'}
        flexDirection={'column'}
        py={'34px'}
        px={{ base: '16px', md: '16px' }}>
        <Box
          pb={'24px'}
          display={'flex'}
          flexDirection={'row'}
          alignItems={'center'}
          justifyContent={'space-between'}
          w={'100%'}
          color={'#ECF0F1'}
          fontSize={'24px'}
          lineHeight={'36px'}
          fontWeight={'500'}>
          <Box
            w={'100%'}
            textAlign={'center'}
            style={isPathActive('login') ? activeStyles : {}}
            onClick={() => handleNavigation('login')}
            cursor='pointer'
            _hover={{
              color: '#00DD25',
              transform: 'scale(1.05)',
              transition: 'all 0.3s ease',
            }}>
            <Text>Login</Text>
          </Box>
          <Box
            w={'100%'}
            textAlign={'center'}
            style={isPathActive('signup') ? activeStyles : {}}
            onClick={() => handleNavigation('signup')}
            cursor='pointer'
            _hover={{
              color: '#00DD25',
              transform: 'scale(1.05)',
              transition: 'all 0.3s ease',
            }}>
            <Text>Sign Up</Text>
          </Box>
        </Box>

        <Suspense fallback={<ProgressSpinner />}>
          {activeTab === 'signup' && <Signup />}
          {activeTab === 'login' && <Login setActiveTab={setActiveTab} />}
          {activeTab === 'resetPassword' && (
            <ResetPassword setActiveTab={setActiveTab} />
          )}
        </Suspense>

        {false && socialAuth()}
      </Box>
    </Box>
  );
};

export default Authentication;
