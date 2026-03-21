import { Button } from '@/components/ui/button';
import { Box, Text } from '@chakra-ui/react';
import { FunctionComponent, useMemo, useState } from 'react';
import SeedsTab from './components/Tabs/SeedsTab';
import VerifyTab from './components/Tabs/VerifyTab';
import usePageData from '@/hooks/usePageData';
import { GameInputsProvider } from './hooks/useGameInputsContext';
import { BetHistoryT } from '../BetHistory/BetHistory.type';
import { originalGamesInfo } from '@/shared/constants/originalGamesInfo.constant';

interface FairnessProps {
  preSelectedSegment?: 'seeds' | 'verify';
  betHistory?: BetHistoryT;
}

const Fairness: FunctionComponent<FairnessProps> = ({
  preSelectedSegment,
  betHistory,
}) => {
  const [segment, setSegment] = useState<'seeds' | 'verify'>(
    preSelectedSegment || 'seeds',
  );

  const segments: { label: string; path: 'seeds' | 'verify' }[] = [
    { label: 'Seeds', path: 'seeds' },
    { label: 'Verfiy', path: 'verify' },
  ];

  const { currentGame } = usePageData();

  /** Bet-specific verify flow must use the row's game, not Zustand `currentGame` (stale off game routes, e.g. bet history). */
  const verifyInitialGame = useMemo(() => {
    if (betHistory?.gameType != null) {
      const fromBet = originalGamesInfo[betHistory.gameType];
      if (fromBet) return fromBet;
    }
    return currentGame;
  }, [betHistory?.gameType, currentGame]);

  const renderSegments = () => {
    return (
      <Box
        px={{ base: '16px', md: '24px' }}
        borderTopRadius={'8px'}
        display={'flex'}
        alignItems={'center'}
        justifyContent={'center'}
        w={'100%'}>
        {segments.map((tab, index) => {
          const isActive = segment === tab.path;
          return (
            <Button
              cursor={'pointer'}
              onClick={() => setSegment(tab.path)}
              unstyled
              display={'flex'}
              flexDir={'column'}
              alignItems={'center'}
              justifyContent={'center'}
              w={'100%'}
              key={index}>
              <Text
                _hover={{ color: '#00DD25' }}
                fontWeight={600}
                fontSize={'16px'}
                lineHeight={'24px'}
                color={isActive ? '#00DD25' : '#ECF0F1'}>
                {tab.label}
              </Text>
              <Box
                bg={isActive ? '#00DD25' : '#CBCCD1'}
                w={'100%'}
                h={isActive ? '4px' : '1px'}
                borderRadius={'20px'}
                mt={'4px'}
              />
            </Button>
          );
        })}
      </Box>
    );
  };

  return (
    <Box minH={'400px'} p={{ base: '0', md: '16px' }} pt={'16px'}>
      <Box w={'100%'} textAlign={'center'} mb={'18px'}>
        <Text fontSize={'20px'} fontWeight={'600'} lineHeight={'28px'}>
          Provably Fair
        </Text>
      </Box>
      {renderSegments()}
      <Box
        mb={{ base: '16px', md: '0px' }}
        h={'100%'}
        display={'flex'}
        flexDir={'column'}
        gap={'16px'}
        mt={'16px'}
        py={'16px'}
        px={{ base: '16px', md: '24px' }}
        borderBottomRightRadius={'8px'}>
        {segment === 'seeds' && <SeedsTab />}
        {segment === 'verify' && (
          <GameInputsProvider betHistory={betHistory}>
            <VerifyTab initialGameValue={verifyInitialGame} />
          </GameInputsProvider>
        )}
      </Box>
    </Box>
  );
};

export default Fairness;
