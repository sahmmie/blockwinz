import { Button } from '@/components/ui/button';
import { Box, Text } from '@chakra-ui/react';
import { FunctionComponent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import tabLinks from './TabLinks.data';

interface AccountSettingsTabProps {}

const AccountSettingsTab: FunctionComponent<AccountSettingsTabProps> = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <Box
      flexDirection={{ base: 'column', md: 'row' }}
      py={{ base: '12px', md: '24px' }}
      gap={{ base: '14px', md: '0' }}
      px={'12px'}
      borderTopRadius={'8px'}
      borderBottomRadius={'4px'}
      display={'flex'}
      alignItems={'center'}
      justifyContent={'center'}
      w={'100%'}
      bg={'#151832'}>
      {tabLinks.map((tab, index) => {
        const isActive = location.pathname === tab.link;
        return (
          <Box
            display={'flex'}
            flexDir={'column'}
            alignItems={'center'}
            justifyContent={'center'}
            w={'100%'}
            key={index}>
            <Button unstyled onClick={() => navigate(tab.link)}>
              <Text
                _hover={{ color: '#00DD25' }}
                fontWeight={500}
                fontSize={{ base: '16px', md: '18px' }}
                color={isActive ? '#00DD25' : '#ECF0F1'}>
                {tab.label}
              </Text>
            </Button>
            {isActive && (
              <Box
                bg={'#00DD25'}
                w={'80%'}
                h={{ base: '3px', md: '6px' }}
                borderRadius={'20px'}
                mt={'8px'}
              />
            )}
          </Box>
        );
      })}
    </Box>
  );
};

export default AccountSettingsTab;
