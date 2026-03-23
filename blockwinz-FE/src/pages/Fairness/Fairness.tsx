import { Button } from '@/components/ui/button';
import { Box, Text } from '@chakra-ui/react';
import { FunctionComponent, useCallback, useMemo, useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import SeedsTab from './components/Tabs/SeedsTab';
import VerifyTab from './components/Tabs/VerifyTab';
import usePageData from '@/hooks/usePageData';
import { GameInputsProvider } from './hooks/useGameInputsContext';
import { BetHistoryT } from '../BetHistory/BetHistory.type';
import { originalGamesInfo } from '@/shared/constants/originalGamesInfo.constant';
import { GameInfo } from '@/shared/types/types';
import {
  parseFairnessUrlSearch,
  patchFairnessUrlParams,
  PF_KEYS,
} from './fairnessUrlParams';
import { BaseFairLogicGenerateForGameDto } from '@/shared/types/core';

interface FairnessProps {
  preSelectedSegment?: 'seeds' | 'verify';
  betHistory?: BetHistoryT;
  /** e.g. game dashboard — ensures correct game if URL has not updated yet */
  initialGameOverride?: GameInfo | null;
}

const Fairness: FunctionComponent<FairnessProps> = ({
  preSelectedSegment,
  betHistory,
  initialGameOverride,
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const parsed = useMemo(
    () => parseFairnessUrlSearch(searchParams),
    [searchParams],
  );

  const initialSegment =
    preSelectedSegment ?? parsed.tab ?? 'seeds';
  const [segment, setSegment] = useState<'seeds' | 'verify'>(initialSegment);

  useEffect(() => {
    const t = parsed.tab;
    if (t) setSegment(t);
  }, [parsed.tab]);

  const segments: { label: string; path: 'seeds' | 'verify' }[] = [
    { label: 'Seeds', path: 'seeds' },
    { label: 'Verify', path: 'verify' },
  ];

  const { currentGame } = usePageData();

  const verifyInitialGame = useMemo(() => {
    if (betHistory?.gameType != null) {
      const fromBet = originalGamesInfo[betHistory.gameType];
      if (fromBet) return fromBet;
    }
    if (parsed.game) {
      const fromUrl = originalGamesInfo[parsed.game];
      if (fromUrl) return fromUrl;
    }
    if (initialGameOverride) return initialGameOverride;
    return currentGame;
  }, [
    betHistory?.gameType,
    parsed.game,
    initialGameOverride,
    currentGame,
  ]);

  const seedDefaultsFromUrl = useMemo(
    (): Partial<BaseFairLogicGenerateForGameDto> | null => ({
      ...(parsed.clientSeed != null && parsed.clientSeed !== ''
        ? { clientSeed: parsed.clientSeed }
        : {}),
      ...(parsed.serverSeed != null && parsed.serverSeed !== ''
        ? { serverSeed: parsed.serverSeed }
        : {}),
      ...(parsed.nonce != null ? { nonce: parsed.nonce } : {}),
    }),
    [parsed.clientSeed, parsed.serverSeed, parsed.nonce],
  );

  /** Keep seeds out of the address bar; nonce still syncs for shareable verify links. */
  const commitSeedsToUrl = useCallback(
    (inputs: BaseFairLogicGenerateForGameDto) => {
      setSearchParams(
        prev =>
          patchFairnessUrlParams(prev, {
            [PF_KEYS.CLIENT]: null,
            [PF_KEYS.SERVER]: null,
            [PF_KEYS.NONCE]: inputs.nonce,
          }),
        { replace: true },
      );
    },
    [setSearchParams],
  );

  const goSegment = useCallback(
    (path: 'seeds' | 'verify') => {
      setSegment(path);
      setSearchParams(
        prev =>
          patchFairnessUrlParams(prev, {
            [PF_KEYS.TAB]: path,
          }),
        { replace: true },
      );
    },
    [setSearchParams],
  );

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
              onClick={() => goSegment(tab.path)}
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
          <GameInputsProvider
            betHistory={betHistory}
            seedDefaultsFromUrl={seedDefaultsFromUrl}
            onBaseInputsCommit={commitSeedsToUrl}>
            <VerifyTab initialGameValue={verifyInitialGame} />
          </GameInputsProvider>
        )}
      </Box>
    </Box>
  );
};

export default Fairness;
