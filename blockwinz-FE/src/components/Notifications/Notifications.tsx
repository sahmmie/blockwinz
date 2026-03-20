import { APP_VERSION } from '@/shared/constants/app.constant';
import { Box, VStack, Text } from '@chakra-ui/react';
import { FunctionComponent } from 'react';

interface NotificationsProps {}

interface NotificationI {
  title: string;
  type: string;
}

const Notifications: FunctionComponent<NotificationsProps> = () => {
  const notifications: NotificationI[] = [];

  const renderNotifications = () => {
    return (
      <VStack align='start' gap={3}>
        {notifications.map((notification, index) => (
          <Box
            key={index}
            border={'1px solid #62E166'}
            borderRadius={'8px'}
            w={'100%'}
            py={'16px'}
            px={'12px'}
            bg={'#D9D9D914'}>
            <Text fontSize={'14px'} fontWeight={'500'}>
              {notification.title}
            </Text>
          </Box>
        ))}
      </VStack>
    );
  };

  const renderEmptyNotifications = () => {
    return (
      <>
        <Box
          w={'100%'}
          h={'200px'}
          display={'flex'}
          alignItems={'center'}
          justifyContent={'center'}>
          <Text fontSize={'16px'} fontWeight={'600'} lineHeight={'32px'}>
            No Notification Available
          </Text>
        </Box>
      </>
    );
  };

  return (
    <>
      <Box>{notifications.length > 0 && renderNotifications()}</Box>
      <Box>{notifications.length === 0 && renderEmptyNotifications()}</Box>
      {/* show app version  */}
      <Box mt={2} textAlign='center'>
        <Text fontSize='xs' color='gray.500'>
          Blockwinz {APP_VERSION}
        </Text>
      </Box>
    </>
  );
};

export default Notifications;
