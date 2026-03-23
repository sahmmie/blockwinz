import {
  Box,
  HStack,
  Text,
  VStack,
  Badge,
  SimpleGrid,
} from '@chakra-ui/react';
import { format } from 'date-fns';
import { FunctionComponent, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import usePageData from '@/hooks/usePageData';
import useWalletState from '@/hooks/useWalletState';
import type { GameInfo } from '@/shared/types/types';
import { useLobbyHubList } from '@/casinoGames/multiplayer/useLobbyHubList';
import type { MultiplayerSessionRow } from '@/casinoGames/multiplayer/types';
import { getJoinLobbyBlockReason, shortHostLabel } from '@/casinoGames/multiplayer/lobbyJoinRules';
import { SocketProvider } from '@/context/socketContext';
import { isLobbyHubStatic } from '@/casinoGames/multiplayer/isLobbyHubStatic';
import { getLobbiesHubTabs } from './lobbiesHubTabs';

function LobbyWaitingCard({
  game,
  lobby,
  viewerCurrency,
  viewerStake,
  onJoin,
  joinPreviewOnly,
}: {
  game: GameInfo;
  lobby: MultiplayerSessionRow;
  viewerCurrency: string;
  viewerStake: number;
  onJoin: (sessionId: string) => void;
  joinPreviewOnly?: boolean;
}) {
  const max = lobby.maxPlayers ?? 2;
  const count = lobby.players?.length ?? 0;
  const openSlots = Math.max(0, max - count);
  const waiting = lobby.gameStatus === 'pending' && openSlots > 0;
  const block = getJoinLobbyBlockReason(lobby, viewerCurrency, viewerStake);
  const disabled = Boolean(block) || joinPreviewOnly;
  const joinTitle = joinPreviewOnly
    ? 'Preview only — enable live lobbies to join'
    : block ?? undefined;

  return (
    <Box
      borderRadius='md'
      borderWidth='1px'
      borderColor={waiting ? 'whiteAlpha.200' : 'whiteAlpha.100'}
      bg='#000A27'
      p={{ base: 4, md: 5 }}
      transition='border-color 0.15s ease'
      _hover={{ borderColor: 'whiteAlpha.300' }}>
      <HStack justify='space-between' align='flex-start' gap={4} flexWrap='wrap'>
        <HStack align='flex-start' gap={3} flex={1} minW={0}>
          <Box
            flexShrink={0}
            w='44px'
            h='44px'
            borderRadius='10px'
            bg='#151832'
            display='flex'
            alignItems='center'
            justifyContent='center'
            overflow='hidden'>
            <img src={game.icon} alt='' width={32} height={32} aria-hidden />
          </Box>
          <VStack align='flex-start' gap={1} minW={0}>
            <HStack gap={2} flexWrap='wrap'>
              <Text fontSize='sm' fontWeight='700' color='white'>
                {game.name}
              </Text>
              {waiting ? (
                <Badge
                  bg='rgba(0, 221, 37, 0.15)'
                  color='#00DD25'
                  fontSize='10px'
                  px={2}
                  py={0.5}
                  borderRadius='md'
                  textTransform='uppercase'
                  letterSpacing='0.06em'>
                  Waiting for players
                </Badge>
              ) : (
                <Badge
                  bg='whiteAlpha.200'
                  color='gray.300'
                  fontSize='10px'
                  px={2}
                  py={0.5}
                  borderRadius='md'
                  textTransform='uppercase'
                  letterSpacing='0.06em'>
                  Filling up
                </Badge>
              )}
            </HStack>
            <Text fontSize='xs' color='gray.400' lineHeight='short'>
              Host · {shortHostLabel(lobby.hostUserId)}
            </Text>
            <Text fontSize='sm' color='gray.200'>
              Stake{' '}
              <Text as='span' fontWeight='700' color='white'>
                {lobby.betAmount} {lobby.currency.toUpperCase()}
              </Text>
              {lobby.betAmountMustEqual && (
                <Text as='span' fontSize='xs' color='gray.500' ml={2}>
                  (exact stake)
                </Text>
              )}
            </Text>
          </VStack>
        </HStack>

        <VStack align='flex-end' gap={3} flexShrink={0}>
          <VStack align='flex-end' gap={1}>
            <Text fontSize='xs' color='gray.500' textTransform='uppercase' letterSpacing='0.05em'>
              Seats
            </Text>
            <HStack gap={1}>
              {Array.from({ length: max }).map((_, i) => (
                <Box
                  key={i}
                  w='10px'
                  h='10px'
                  borderRadius='full'
                  bg={i < count ? '#00DD25' : 'whiteAlpha.300'}
                  borderWidth='1px'
                  borderColor={i < count ? '#00DD25' : 'whiteAlpha.400'}
                />
              ))}
            </HStack>
            <Text fontSize='xs' color='gray.400'>
              {count} / {max} joined
            </Text>
          </VStack>
          <Button
            minW='120px'
            h='40px'
            bg={disabled ? undefined : '#00DD25'}
            color={disabled ? undefined : '#151832'}
            variant={disabled ? 'outline' : 'solid'}
            disabled={disabled}
            title={joinTitle}
            onClick={() => onJoin(lobby._id)}>
            Join table
          </Button>
        </VStack>
      </HStack>
    </Box>
  );
}

const LobbiesInner: FunctionComponent = () => {
  const { setTitle } = usePageData();
  const navigate = useNavigate();
  const { selectedBalance } = useWalletState();
  const viewerCurrency = selectedBalance?.currency ?? '';
  const viewerStake = selectedBalance?.availableBalance ?? 0;

  const hubTabs = useMemo(() => getLobbiesHubTabs(), []);
  const [activeTabKey, setActiveTabKey] = useState(
    () => hubTabs[0]?.key ?? '',
  );

  const activeTab = useMemo(
    () => hubTabs.find((t) => t.key === activeTabKey) ?? hubTabs[0],
    [hubTabs, activeTabKey],
  );

  const activeGame = activeTab?.game;
  const { lobbies, isLoading, lastFetchedAt, refresh } = useLobbyHubList(
    activeTab?.comingSoon ? null : activeTab?.gameType ?? null,
  );

  useEffect(() => {
    setTitle('Open lobbies · Blockwinz');
  }, [setTitle]);

  const onJoinTable = (sessionId: string) => {
    if (!activeGame?.link || activeTab?.comingSoon) return;
    navigate(activeGame.link, {
      state: { pendingJoinLobbyId: sessionId },
    });
  };

  if (!activeGame) {
    return (
      <Box
        w='100%'
        bg='#151832'
        borderRadius='8px'
        px={{ base: 4, md: 8 }}
        py={8}>
        <Text color='gray.400'>No multiplayer games available yet.</Text>
      </Box>
    );
  }

  return (
    <Box
      w='100%'
      bg='#151832'
      borderRadius='8px'
      px={{ base: 4, md: 8 }}
      py={{ base: 5, md: 7 }}>
      <Text
        fontSize='xs'
        fontWeight='600'
        color='gray.500'
        textTransform='uppercase'
        letterSpacing='0.08em'
        mb={1}>
        Multiplayer
      </Text>
      <Text fontSize='2xl' fontWeight='700' color='white' mb={2}>
        Open lobbies
      </Text>
      <Box mb={5}>
        <Text fontSize='sm' color='gray.400' maxW='xl' lineHeight='tall' mb={2}>
          Tables that are still filling up—join before the match starts.
        </Text>
        <Text fontSize='xs' color='gray.500' lineHeight='short' maxW='xl'>
          Some tables need your wallet currency and stake to match before you can
          join.
        </Text>
      </Box>

      <Box
        w='100%'
        display='flex'
        flexWrap='wrap'
        gap='6px'
        bg='rgba(255, 255, 255, 0.05)'
        borderRadius='8px'
        p='6px'
        borderWidth='1px'
        borderColor='whiteAlpha.150'
        mb={5}>
        {hubTabs.map((tab) => {
          const active = activeTabKey === tab.key;
          return (
            <Button
              key={tab.key}
              type='button'
              variant='ghost'
              flex={{ base: '1 1 calc(50% - 6px)', md: '1 1 auto' }}
              minW={{ md: '120px' }}
              h='40px'
              borderRadius='8px'
              onClick={() => setActiveTabKey(tab.key)}
              bg={active ? '#00DD25' : 'transparent'}
              color={active ? '#151832' : '#ECF0F1'}
              fontWeight='600'
              fontSize='sm'
              opacity={tab.comingSoon ? 0.65 : 1}
              _hover={{
                bg: active ? '#00DD25' : 'rgba(255,255,255,0.08)',
              }}>
              {tab.game.name}
              {tab.comingSoon ? ' · soon' : ''}
            </Button>
          );
        })}
      </Box>

      <HStack justify='space-between' align='center' mb={4} flexWrap='wrap' gap={2}>
        <Text fontSize='xs' color='gray.500'>
          {lastFetchedAt
            ? `Updated ${format(lastFetchedAt, 'HH:mm:ss')}`
            : 'Loading…'}
        </Text>
        <Button
          size='sm'
          variant='outline'
          borderColor='whiteAlpha.300'
          onClick={() => void refresh()}
          loading={isLoading}>
          Refresh
        </Button>
      </HStack>

      {isLoading && lobbies.length === 0 ? (
        <Box py={12} textAlign='center'>
          <Text fontSize='sm' color='gray.500'>
            Loading open tables…
          </Text>
        </Box>
      ) : lobbies.length === 0 ? (
        <Box
          borderRadius='md'
          borderWidth='1px'
          borderStyle='dashed'
          borderColor='whiteAlpha.150'
          bg='#000A27'
          py={{ base: 12, md: 16 }}
          px={6}
          textAlign='center'>
          {activeTab?.comingSoon ? (
            <>
              <Text fontSize='md' fontWeight='600' color='gray.300' mb={2}>
                {activeGame.name} is coming soon
              </Text>
              <Text fontSize='sm' color='gray.500' mb={6} maxW='md' mx='auto'>
                Open lobbies will appear here once this title launches. Try Tic
                Tac Toe for live tables.
              </Text>
            </>
          ) : (
            <>
              <Text fontSize='md' fontWeight='600' color='gray.300' mb={2}>
                No open tables for {activeGame.name}
              </Text>
              <Text fontSize='sm' color='gray.500' mb={6} maxW='md' mx='auto'>
                When hosts create public rooms, they will show up here. You can
                also jump into the game to use quick match or create a lobby.
              </Text>
            </>
          )}
          {!activeTab?.comingSoon && (
            <Button
              onClick={() => navigate(activeGame.link)}
              bg='#00DD25'
              color='#151832'
              fontWeight='600'
              h='44px'
              px={8}>
              Go to {activeGame.name}
            </Button>
          )}
        </Box>
      ) : (
        <SimpleGrid columns={1} gap={4}>
          {lobbies.map((lobby) => (
            <LobbyWaitingCard
              key={lobby._id}
              game={activeGame}
              lobby={lobby}
              viewerCurrency={viewerCurrency}
              viewerStake={Number(viewerStake)}
              onJoin={onJoinTable}
              joinPreviewOnly={isLobbyHubStatic()}
            />
          ))}
        </SimpleGrid>
      )}
    </Box>
  );
};

const Lobbies: FunctionComponent = () => (
  <SocketProvider namespace='game'>
    <LobbiesInner />
  </SocketProvider>
);

export default Lobbies;
