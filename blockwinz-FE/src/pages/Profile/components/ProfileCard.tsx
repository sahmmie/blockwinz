import { Box, Text, Image } from '@chakra-ui/react';
import { FunctionComponent } from 'react';
import ProfileIcon from '@/assets/icons/profile-blue-icon.svg';
import MailIcon from '@/assets/icons/mail-icon.svg';
import VipIcon from '@/assets/icons/vip-icon.svg';
import StarIcon from '@/assets/icons/solar_star-icon.svg';
import PasswordIcon from '@/assets/icons/password-icon.svg';
import VerifiedIcon from '@/assets/icons/email-verified-icon.svg';
import { Button } from '@/components/ui/button';
import ProgressBar from '@/components/ProgressBar/ProgressBar';
import useAccount from '@/hooks/userAccount';
import useModal from '@/hooks/useModal';
import EditEmailModal from './EditEmailModal';
import ChangePasswordModal from './ChangePasswordModal';

interface ProfileCardProps {}

const ProfileCard: FunctionComponent<ProfileCardProps> = () => {
  const { userData } = useAccount();
  const { openModal } = useModal();
  return (
    <Box>
      <Box
        w={'100%'}
        mt={'24px'}
        display={'grid'}
        gridTemplateColumns={{
          base: 'repeat(1, 1fr)', // base devices
          md: 'repeat(2, 1fr)', // tablets
          lg: 'repeat(4, 1fr)',
        }}
        justifyContent={'center'}
        gap={'32px'}>
        <Box
          borderRadius={'8px'}
          py={'34px'}
          px={'12px'}
          gap={'8px'}
          display={'flex'}
          flexDir={'column'}
          justifyContent={'center'}
          alignItems={'center'}
          w={'100%'}
          boxShadow='-2px 2px 8px 2px rgba(0, 10, 39, 0.35), 2px -2px 4px 2px rgba(0, 10, 39, 0.35)'
          border={'border: 0.3px solid rgba(236, 240, 241, 0.1)'}>
          <img
            src={ProfileIcon}
            alt='Profile Card'
            style={{ width: '68px', height: '68px' }}
          />
          <Text mt={'8px'}>{userData?.username}</Text>
          <Text textWrap={'nowrap'}>
            {' '}
            Joined{' '}
            {userData?.createdAt
              ? new Date(userData.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                })
              : 'N/A'}
          </Text>
        </Box>
        <Box
          position={'relative'}
          borderRadius={'8px'}
          py={'34px'}
          px={'12px'}
          gap={'8px'}
          display={'flex'}
          flexDir={'column'}
          justifyContent={'center'}
          alignItems={'center'}
          w={'100%'}
          boxShadow='-2px 2px 8px 2px rgba(0, 10, 39, 0.35), 2px -2px 4px 2px rgba(0, 10, 39, 0.35)'
          border={'border: 0.3px solid rgba(236, 240, 241, 0.1)'}>
          {userData?.emailVerified && (
            <Image
              src={VerifiedIcon}
              alt='Email Verified'
              w='24px'
              h='24px'
              position={'absolute'}
              top={'8px'}
              right={'10px'}
            />
          )}
          <img
            src={MailIcon}
            alt='Mail Card'
            style={{ width: '68px', height: '68px' }}
          />
          <Text textWrap={'nowrap'} mt={'8px'}>
            {userData?.email}
          </Text>
          <Button
            unstyled
            cursor={'pointer'}
            textDecor={'underline'}
            color={'rgba(203, 204, 209, 1)'}
            onClick={() =>
              openModal(<EditEmailModal />, 'Update Email', { width: '500px' })
            }>
            Edit
          </Button>
        </Box>
        <Box
          borderRadius={'8px'}
          py={'34px'}
          px={'12px'}
          gap={'8px'}
          display={'flex'}
          flexDir={'column'}
          justifyContent={'center'}
          alignItems={'center'}
          w={'100%'}
          boxShadow='-2px 2px 8px 2px rgba(0, 10, 39, 0.35), 2px -2px 4px 2px rgba(0, 10, 39, 0.35)'
          border={'border: 0.3px solid rgba(236, 240, 241, 0.1)'}>
          <img
            src={PasswordIcon}
            alt='Password Card'
            style={{ width: '68px', height: '68px' }}
          />
          <Text mt={'8px'}>************</Text>
          <Button
            unstyled
            cursor={'pointer'}
            textDecor={'underline'}
            color={'rgba(203, 204, 209, 1)'}
            onClick={() => openModal(<ChangePasswordModal />, 'Change Password', { width: '500px' })}
          >
            Change Password
          </Button>
        </Box>
        <Box
          borderRadius={'8px'}
          py={'24px'}
          px={'12px'}
          gap={'8px'}
          display={'flex'}
          flexDir={'column'}
          justifyContent={'center'}
          alignItems={'center'}
          w={'100%'}
          boxShadow='-2px 2px 8px 2px rgba(0, 10, 39, 0.35), 2px -2px 4px 2px rgba(0, 10, 39, 0.35)'
          border={'border: 0.3px solid rgba(236, 240, 241, 0.1)'}>
          <img
            src={VipIcon}
            alt='Vip Card'
            style={{ width: '68px', height: '68px' }}
          />
          <Box
            w={'100%'}
            display={'flex'}
            justifyContent={'space-between'}
            alignItems={'center'}>
            <Text>VIP Progess</Text>
            <Text>0.00%</Text>
          </Box>
          <ProgressBar
            props={{
              value: 0,
            }}
          />
          <Box
            gap={'8px'}
            w={'100%'}
            display={'flex'}
            justifyContent={'start'}
            alignItems={'center'}
            mt={'8px'}>
            <img
              src={StarIcon}
              alt='Star Icon'
              style={{ width: '24px', height: '24px' }}
            />
            <Text>Unranked</Text>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default ProfileCard;
