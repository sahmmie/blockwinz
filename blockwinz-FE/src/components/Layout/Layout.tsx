import useChat from '@/hooks/useChat';
import { useIsMobile, useNavbarHeight } from '@/hooks/useIsMobile';
import Chat from '@/pages/Chat/Chat';
import { Box } from '@chakra-ui/react';
import React, { memo, useCallback, useRef, useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import BottomNav from '../BottomNav/BottomNav';
import Footer from '../Footer/Footer'; // ✅ import your Footer
import Modal from '../Modal/Modal';
import Navbar from '../Navbar/Navbar';
import ScrollToTop from '../ScrollTop/ScrollToTop';
import Sidebar from '../Sidebar/Sidebar';

const Layout = ({ children }: { children?: React.ReactNode }) => {
  const { chatIsOpen } = useChat();
  const NAVBAR_HEIGHT = useNavbarHeight();
  const navbarHeightInPx = `${NAVBAR_HEIGHT}px`;
  const mainContentRef = useRef<HTMLDivElement>(null);

  const isMobile = useIsMobile();
  const [sidebarIsCollapsed, setSidebarIsCollapsed] = useState(false);

  // --- Chat panel mount/unmount logic for animation ---
  const [shouldRenderChat, setShouldRenderChat] = useState(chatIsOpen);
  const [isChatVisible, setIsChatVisible] = useState(chatIsOpen);

  useEffect(() => {
    if (chatIsOpen) {
      setShouldRenderChat(true);
      // On next tick, set visible to true to trigger opening animation
      setTimeout(() => setIsChatVisible(true), 0);
    } else {
      setIsChatVisible(false); // Start closing animation
      const timeout = setTimeout(() => setShouldRenderChat(false), 300); // 300ms matches transition
      return () => clearTimeout(timeout);
    }
  }, [chatIsOpen]);
  // ----------------------------------------------------

  const renderChat = useCallback(() => {
    return (
      <Box
        display={{ base: 'none', md: 'block' }}
        width={isChatVisible ? '360px' : '0'}
        flexShrink={0}
        overflow='hidden'
        transition='width 0.3s ease'>
        <Box
          w='360px'
          h='100%'
          css={{
            transition: 'transform 0.3s ease, opacity 0.3s ease',
            transform: isChatVisible ? 'translateX(0)' : 'translateX(100%)',
            opacity: isChatVisible ? 1 : 0,
            pointerEvents: isChatVisible ? 'auto' : 'none',
          }}>
          <Chat />
        </Box>
      </Box>
    );
  }, [isChatVisible]);

  return (
    <Box h='100vh' overflow='hidden' position='relative'>
      <ScrollToTop scrollRef={mainContentRef} />

      {/* Navbar */}
      <Box h={navbarHeightInPx}>
        <Navbar
          setSidebarIsCollapsed={setSidebarIsCollapsed}
          sidebarIsCollapsed={sidebarIsCollapsed}
        />
      </Box>

      {/* Main layout */}
      <Box
        display={{ base: 'block', md: 'flex' }}
        flexDirection='row'
        pt='16px'
        h={`calc(100vh - ${navbarHeightInPx})`}
        minWidth='0'>
        {/* Sidebar */}
        <Box
          w={sidebarIsCollapsed ? '68px' : '210px'}
          transition='width 0.3s ease'
          display={{ base: 'none', md: 'block' }}
          h='100%'
          overflowY='auto'
          flexShrink={0}>
          <Sidebar sidebarIsCollapsed={sidebarIsCollapsed} />
        </Box>

        {/* Main content + footer */}
        <Box
          display='flex'
          flexDirection='column'
          ref={mainContentRef}
          flex='1'
          minW={0}
          h='100%'
          overflowY='auto'
          overflowX='hidden'>
          {/* Inner content with max width */}
          <Box
            flex='1'
            display='flex'
            flexDirection='column'
            alignItems='center'
            w='100%'
            minW={0}
            px={{ base: '16px', md: '16px' }}>
            <Box
              w='full'
              minW={0}
              maxW={{
                base: '100%',
                md: '100%',
                lg: '100%',
                xl: '80rem',
              }}>
              <Modal />
              {children ? children : <Outlet />}
            </Box>
          </Box>

          {/* ✅ Footer outside max-width but scrolls naturally */}
          <Box mt='auto' w='full' mb={{ base: '20px', md: '0' }} pt={'40px'}>
            <Footer />
          </Box>
        </Box>

        {/* Chat panel with exit animation and delayed unmount */}
        {!isMobile && shouldRenderChat && renderChat()}
      </Box>

      {/* ✅ Fixed BottomNav on mobile */}
      <Box
        display={{ base: 'block', md: 'none' }}
        position='fixed'
        bottom='0'
        left='0'
        width='100%'
        zIndex='999'
        bg='white'>
        <BottomNav />
      </Box>
    </Box>
  );
};

export default memo(Layout);
