import { Box, Text } from '@chakra-ui/react';
import { FunctionComponent, useState } from 'react';
import ProfileCard from './components/ProfileCard';
import ProfileStats from './components/ProfileStats';
import { Button } from '@/components/ui/button';
import useAccount from '@/hooks/userAccount';
import { toaster } from '@/components/ui/toaster';
import axiosService from '@/lib/axios';

interface ProfileDetailsProps {}

const ProfileDetails: FunctionComponent<ProfileDetailsProps> = () => {
  const { userData } = useAccount();
  const [loading, setLoading] = useState(false);

  const resendVerificationEmail = async () => {
    try {
      setLoading(true);
      await axiosService.post('/authentication/resend-verification', {
        email: userData?.email,
      });
      toaster.create({
        title: 'Success!',
        description: 'Verification email has been sent.',
        type: 'success',
      });
    } catch {
      toaster.create({
        title: 'Failed to send verification email.',
        description: 'Please try again.',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const renderProfileDetails = () => {
    return (
      <Box
        fontSize={'14px'}
        w={'100%'}
        bg={'#151832'}
        px={'16px'}
        borderRadius={'8px'}
        pb={'34px'}
        pt={'16px'}>
        <Box
          display={'flex'}
          flexDirection={{ base: 'column', md: 'row' }}
          justifyContent={'space-between'}
          alignItems={'center'}>
          <Box w={{ base: '100%', md: 'auto' }}>
            <Text fontSize={'24px'} fontWeight={'500'}>
              Profile
            </Text>
            <Text mt={'4px'}>
              Update Your profile and personal settings here
            </Text>
          </Box>
          {!userData?.emailVerified && (
            <Box w={{ base: '100%', md: 'auto' }} mt={{ base: '12px', md: 0 }}>
              <Button
                disabled={userData?.emailVerified || loading}
                loading={loading}
                onClick={resendVerificationEmail}
                variant={'outline'}
                border={'1px solid #62E166'}>
                Resend Verification Email
              </Button>
            </Box>
          )}
        </Box>
        <ProfileCard />
      </Box>
    );
  };

  return (
    <>
      <Box mt={'24px'}>{renderProfileDetails()}</Box>
      <Box mt={'12px'}>
        <ProfileStats />
      </Box>
    </>
  );
};

export default ProfileDetails;
