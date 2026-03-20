import { FunctionComponent, useState } from 'react';

import {
  DrawerRoot,
  DrawerTrigger,
  DrawerBackdrop,
  DrawerBody,
  DrawerContent,
} from '../ui/drawer'; // adjust path to where your custom drawer exports are
import Sidebar from '../Sidebar/Sidebar';

import bwIcon from '@/assets/bw-white-small-icon.svg';
import { Box } from '@chakra-ui/react';

interface MobileMenuProps {
  menuButton: JSX.Element;
}

const MobileMenu: FunctionComponent<MobileMenuProps> = ({ menuButton }) => {
  const [mobileMenuIsOpen, setMobileMenuIsOpen] = useState(false);

  return (
    <DrawerRoot
      size={'xs'}
      open={mobileMenuIsOpen}
      onOpenChange={e => setMobileMenuIsOpen(e.open)}
      placement='start'>
      <DrawerTrigger asChild>{menuButton}</DrawerTrigger>

      <DrawerBackdrop />

      <DrawerContent bg={'#000A27'}>
        <DrawerBody padding={'0'} m={'0'}>
          <Box px={'16px'} py={'32px'} bg={'#151832'} mb={'12px'}>
            <img
              src={bwIcon}
              alt='Blockwinz Logo'
              style={{ width: '220px', height: '24px' }}
            />
          </Box>
          <Sidebar
            sidebarIsCollapsed={false}
            setMobileMenuIsOpen={setMobileMenuIsOpen}
          />
        </DrawerBody>
      </DrawerContent>
    </DrawerRoot>
  );
};

export default MobileMenu;
