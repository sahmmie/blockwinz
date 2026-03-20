import { Box, Text, Image } from '@chakra-ui/react';
import { FunctionComponent } from 'react';
import NoStatIcon from '@/assets/icons/no-stats-bars-icon.svg';

interface ProfileStatsProps {}

const ProfileStats: FunctionComponent<ProfileStatsProps> = () => {
  return (
    <>
      <Box
        h={'400px'}
        w={'100%'}
        bg={'#151832'}
        px={'16px'}
        pb={'64px'}
        borderRadius={'8px'}>
        <Text pt={'16px'} fontSize={'24px'} fontWeight={'500'}>
          Statistics
        </Text>
        <Box
          w={'100%'}
          h={'100%'}
          display={'flex'}
          flexDir={'column'}
          gap={'32px'}
          justifyContent={'center'}
          alignItems={'center'}>
          <Image src={NoStatIcon} alt='No Stat Card' w={'120px'} h={'120px'} />
          <Text fontSize={'16px'} fontWeight={'500'}>
            This user has no visible statistics.
          </Text>
        </Box>
      </Box>
    </>
  );
};

export default ProfileStats;
