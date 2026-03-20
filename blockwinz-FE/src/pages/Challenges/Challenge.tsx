import { Box, Text, Image } from '@chakra-ui/react';
import { FunctionComponent, useEffect, useState } from 'react';
import ChallangeIcon from '@/assets/icons/challenges-icon.svg';
import ProgressBar from '@/components/ProgressBar/ProgressBar';
import { Button } from '@/components/ui/button';
import axiosService from '@/lib/axios';
import { UserChallengeListItem } from '@/shared/interfaces/challenge.interface';
import { parseFloatValue } from '@/shared/utils/common';

interface ChallengesProps {}

const Challenges: FunctionComponent<ChallengesProps> = () => {
  const [challenges, setChallenges] = useState<UserChallengeListItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChallenges = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axiosService.get<UserChallengeListItem[]>(
          '/challenges/user',
        );
        // Sort by type: daily, weekly, monthly, lifetime
        const typeOrder = ['daily', 'weekly', 'monthly', 'lifetime'];
        const sorted = response.data.slice().sort((a, b) => {
          const aIndex = typeOrder.indexOf(a.challenge.type);
          const bIndex = typeOrder.indexOf(b.challenge.type);
          return aIndex - bIndex;
        });
        setChallenges(sorted);
      } catch {
        setError('Failed to load challenges.');
      } finally {
        setLoading(false);
      }
    };
    fetchChallenges();
  }, []);

  const renderChallengeItem = (item: UserChallengeListItem, i: number) => {
    const { challenge, progress } = item;
    const progressValue = (Object.values(progress.progress)[0] as number) || 0;
    const goalValue =
      typeof challenge.condition.goal === 'number'
        ? challenge.condition.goal
        : 1;
    const progressBar = goalValue > 0 ? (progressValue / goalValue) * 100 : 0;

    return (
      <Box
        py={{ base: '14px', md: '12px' }}
        pl={{ base: '8px', md: '12px' }}
        pr={{ base: '8px', md: '20px' }}
        key={i}
        bg={'#151832'}
        w={'100%'}
        display={'flex'}
        justifyContent={'space-between'}
        alignItems={'center'}
        borderRadius={'8px'}>
        <Box w={'8/12'} mr={{ base: '8px', md: 0 }}>
          <Text mb={'8px'} fontSize={'18px'} fontWeight={'500'}>
            {challenge.name}
          </Text>
          <Text mb={'12px'} fontSize={'16px'}>
            {challenge.description}
          </Text>
          <ProgressBar
            trackColor='#000A27'
            rangeColor='#00DD25'
            props={{
              w: '100%',
              borderRadius: '8px',
              border: '1px #545463 solid',
              value: progressBar > 100 ? 100 : progressBar,
            }}
          />
        </Box>
        <Box
          ml={{ base: '8px', md: 0 }}
          textAlign={{ base: 'center', md: 'left' }}
          display={{ base: 'block', md: 'flex' }}
          alignItems={'center'}
          gap={'20px'}>
          <Box mb={{ base: '8px', md: 0 }}>
            <Text fontWeight={'600'} fontSize={'18px'}>
              {parseFloatValue(progressValue, 0)}/{goalValue}
            </Text>
          </Box>
          <Box>
            <Button
              fontWeight={'500'}
              disabled={!progress.completed || progress.claimed}
              bg={'#00DD25'}
              _disabled={{
                bg: progress.claimed ? '#00DD25' : '#545463',
                color: progress.claimed ? '#151832' : '#ECF0F1',
              }}>
              {progress.claimed ? 'Claimed' : 'Claim Reward'}
            </Button>
          </Box>
        </Box>
      </Box>
    );
  };

  const renderNoData = () => {
    return (
      <>
        <Box
          borderRadius='8px'
          bg={'#151832'}
          mt={'32px'}
          display={'flex'}
          flexDir={'column'}
          alignItems={'center'}
          justifyContent={'center'}
          w={'100%'}
          height={'400px'}>
          <Box mb={'14px'}>
            <Text fontWeight={600} fontSize={{ md: '28px', base: '16px' }}>
              No challenges available
            </Text>
          </Box>
          <Box mb={'28px'}>
            <Text fontWeight={500} fontSize={{ md: '16px', base: '14px' }}>
              There are no challenges available at the moment. Come back later.
            </Text>
          </Box>
        </Box>
      </>
    );
  };

  return (
    <>
      <Box>
        <Box
          bg={'#151832'}
          height={'68px'}
          borderRadius={'8px'}
          alignItems={'center'}
          display={'flex'}
          px={'16px'}>
          <Image
            src={ChallangeIcon}
            alt='Challange Icon'
            w={'32px'}
            h={'32px'}
          />
          <Text fontSize='24px' fontWeight='500' ml='12px'>
            Challenges
          </Text>
        </Box>
        {loading && (
          <Box mt='32px' textAlign='center'>
            <Text>Loading challenges...</Text>
          </Box>
        )}
        {error && renderNoData()}
        {!loading && !error && challenges?.length > 0 && (
          <Box mt='16px' gap={'16px'} display={'flex'} flexDir={'column'}>
            {challenges.map((item, i) => renderChallengeItem(item, i))}
          </Box>
        )}
        {!loading && !error && challenges?.length === 0 && renderNoData()}
      </Box>
    </>
  );
};

export default Challenges;
