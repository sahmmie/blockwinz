import { Button } from '@chakra-ui/react';
import { FunctionComponent } from 'react';
import {
  PopoverArrow,
  PopoverBody,
  PopoverCloseTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverRoot,
  PopoverTrigger,
} from '../ui/popover';
import NotificationIcon from '@/assets/icons/notifications-icon.svg';
import Notifications from './Notifications';

interface NotificationsPopoverProps {}

const NotificationsPopover: FunctionComponent<
  NotificationsPopoverProps
> = () => {
  return (
    <PopoverRoot lazyMount unmountOnExit>
      <PopoverTrigger asChild>
        <Button unstyled cursor={'pointer'}>
          <img
            src={NotificationIcon}
            alt='Notification icon'
            style={{ width: '24px', height: '24px' }}
          />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        w={{ base: '300px', md: '400px' }}
        boxShadow='md'
        borderRadius='md'
        bg='#000A27'>
        <PopoverArrow bg={'#000A27'} />
        <PopoverHeader
          p={'0'}
          px={'16px'}
          pt={'16px'}
          display={'flex'}
          alignItems={'center'}
          gap={'4px'}
          fontSize={'16px'}>
          <img
            src={NotificationIcon}
            alt='Notification Icon'
            style={{ width: '20px', height: '20px' }}
          />
          Notifications
        </PopoverHeader>
        <PopoverCloseTrigger unselectable='on' mt={'2px'} mr={'10px'} />
        <PopoverBody p={'0'} px={'16px'} pb={'12px'} pt={'20px'}>
          <Notifications />
        </PopoverBody>
      </PopoverContent>
    </PopoverRoot>
  );
};

export default NotificationsPopover;
