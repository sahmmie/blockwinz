import { FunctionComponent } from 'react';
import { Box, Text } from '@chakra-ui/react';
import { Button } from '../ui/button';
import { BottomNavData, SideBarLink } from '../Sidebar/SidebarData';
import { useNavigate } from 'react-router-dom';
import MobileMenu from '../MobileMenu/MobileMenu';
import ChatDrawer from '../ChatDrawer/ChatDrawer';

interface BottomNavProps {}

const BottomNav: FunctionComponent<BottomNavProps> = () => {
  const navigate = useNavigate();

  const renderMenuButton = (navData: SideBarLink) => {
    if (navData.link === '/menu') {
      return <MobileMenu key={navData.link} menuButton={buttonUI(navData)} />;
    }
    if (navData.link === '/chat') {
      return <ChatDrawer key={navData.link} chatButton={buttonUI(navData)} />;
    }
    return buttonUI(navData, navigate);
  };

  const buttonUI = (
    navData: SideBarLink,
    func: (link: string) => void = () => {},
  ) => {
    return (
      <Box
        key={navData.link}
        gap={'2px'}
        display={'flex'}
        alignItems={'center'}
        flexDir={'column'}
        w={'100%'}
        h={'100%'}>
        <Button onClick={() => func(navData.link as string)} unstyled>
          <img
            src={navData.icon}
            alt='Menu Icon'
            style={{ width: '24px', height: '24px' }}
          />
        </Button>
        <Text fontSize={'14px'} fontWeight={'400'}>
          {navData.label}
        </Text>
      </Box>
    );
  };

  return (
    <>
      {/* Bottom Nav for mobile */}
      <Box
        display={{ base: 'flex', md: 'none' }}
        pt={'8px'}
        gap={'32px'}
        px={{ base: '16px', md: '0px' }}
        position='fixed'
        bottom='0'
        left='0'
        right='0'
        bg='#151832'
        justifyContent='space-around'
        alignItems='center'
        height='60px'
        zIndex={10}>
        {BottomNavData.map(navData => renderMenuButton(navData))}
      </Box>
    </>
  );
};

export default BottomNav;
