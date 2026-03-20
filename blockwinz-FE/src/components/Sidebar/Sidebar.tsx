import { Box, Text } from '@chakra-ui/react';
import { FunctionComponent, useEffect } from 'react';
import {
  MainTabData,
  SideBarLink,
  settingsSidebarLinks,
  mainSidebarLinks,
  originalGamesSidebarLinks,
  multiplayerGamesSidebarLinks,
} from './SidebarData';
import { NavLink, useLocation } from 'react-router-dom';
import { Button } from '../ui/button';
import useAuth from '@/hooks/useAuth';
import useAccount from '@/hooks/userAccount';
import usePageData from '@/hooks/usePageData';
import { GameCategoryEnum } from '@/shared/enums/gameType.enum';

interface SidebarProps {
  sidebarIsCollapsed: boolean;
  setMobileMenuIsOpen?: (isOpen: boolean) => void;
}

const Sidebar: FunctionComponent<SidebarProps> = ({
  sidebarIsCollapsed,
  setMobileMenuIsOpen,
}) => {
  const location = useLocation();
  const { setToken, isAuthenticated } = useAuth();
  const { setAccountData } = useAccount();
  const { selectedSegment, setSelectedSegment } = usePageData();
  const actvieSegBg = '#00DD25';
  const inActiveSegBg = '#151832';
  const activeSegColor = '#151832';
  const inActiveSegColor = '#D9D9D9';

  const sideBarClick = (path: SideBarLink) => {
    setMobileMenuIsOpen?.(false);
    if (path.clickOnly && path.clickOnly === 'online-support') {
      if (window.$chatwoot) {
        window.$chatwoot.toggle();
      }
    }
    if (path.clickOnly && path.clickOnly === 'logout') {
      setToken(null);
      setAccountData(null);
    }
  };

  useEffect(() => {
    if (location.pathname.includes(GameCategoryEnum.ORIGINALS)) {
      setSelectedSegment(GameCategoryEnum.ORIGINALS);
    }
    if (location.pathname.includes(GameCategoryEnum.MULTIPLAYER)) {
      setSelectedSegment(GameCategoryEnum.MULTIPLAYER);
    }
  }, [location.pathname]);

  const menuItemUI = (item: SideBarLink) => {
    return (
      <NavLink
        onClick={() => sideBarClick(item)}
        to={item.link as string}
        style={({ isActive }) => {
          return {
            fontWeight: isActive && !item.clickOnly ? 'bold' : '',
          };
        }}>
        <Box
          _hover={{
            backgroundColor: 'rgba(80, 80, 98, 0.25)',
          }}
          display={'flex'}
          alignItems={'center'}
          cursor={'pointer'}
          w={'100%'}
          pl={'22px'}
          pr={'6px'}
          py={'10px'}>
          <img
            src={item.icon}
            alt='Menu icon'
            style={{
              width: '24px',
              height: '24px',
              marginRight: '9px',
            }}
          />
          {!sidebarIsCollapsed && (
            <Text fontSize={'15px'} textWrap={'nowrap'}>
              {item.label}
            </Text>
          )}
        </Box>
      </NavLink>
    );
  };

  const dividerUI = () => {
    return <Box h={'0.5px'} bg={'#CBCCD1'} w={'100%'} mb={'6px'} />;
  };

  const prepSideBarData = (data: SideBarLink[]) => {
    return data
      .filter(item => (item.authOnly ? isAuthenticated : true))
      .map((item: SideBarLink, index: number) => {
        const isActivePath = location.pathname === item.link;
        return (
          <Box
            borderLeft={isActivePath ? '4px solid #00DD25' : 'none'}
            borderLeftRadius={'4px'}
            key={'m' + index}>
            {menuItemUI(item)}
            {item.showDivider && dividerUI()}
          </Box>
        );
      });
  };

  return (
    <Box
      fontWeight={'500'}
      lineHeight={'30px'}
      fontSize={'18px'}
      minH={'100vh'} // Full viewport height
      display={'flex'}
      flexDirection={'column'}>
      {/* Top Section */}
      <Box
        w={'100%'}
        bg={'#151832'}
        borderBottomRightRadius={'8px'}
        borderTopRightRadius={'8px'}>
        {/* Originals */}

        {MainTabData.map((item, index) => (
          <Button
            onClick={() => setSelectedSegment(item.link)}
            key={item.link + index}
            display={'flex'}
            alignItems={'left'}
            justifyContent={'left'}
            px={'8px'}
            py={'28px'}
            bg={selectedSegment === item.link ? actvieSegBg : inActiveSegBg}
            w={'100%'}>
            <img
              src={selectedSegment === item.link ? item.icon : item.altIcon}
              alt='Menu icon'
              style={{
                width: '26px',
                height: '26px',
                marginLeft: '14px',
              }}
            />
            {!sidebarIsCollapsed && (
              <Text
                fontWeight={'500'}
                fontSize={'14px'}
                color={
                  selectedSegment === item.link
                    ? activeSegColor
                    : inActiveSegColor
                }>
                {item.label}
              </Text>
            )}
          </Button>
        ))}
      </Box>

      {/* Scrollable Menu Section */}
      <Box
        overflowY={'hidden'} // Always hide scrollbar
        flex={'1'} // Take up remaining space
        mt={'16px'}
        borderBottomRightRadius={'8px'}
        borderTopRightRadius={'8px'}
        bg={'#151832'}>
        {prepSideBarData(mainSidebarLinks)}
        {selectedSegment === GameCategoryEnum.ORIGINALS &&
          prepSideBarData(originalGamesSidebarLinks)}
        {selectedSegment === GameCategoryEnum.MULTIPLAYER &&
          prepSideBarData(multiplayerGamesSidebarLinks)}
        {prepSideBarData(settingsSidebarLinks)}
      </Box>
    </Box>
  );
};

export default Sidebar;

declare global {
  interface Window {
    $chatwoot?: {
      toggle: () => void;
    };
  }
}
