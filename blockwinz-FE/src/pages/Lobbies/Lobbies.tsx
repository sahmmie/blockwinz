import { Box, HStack, Image, Text, VStack } from '@chakra-ui/react';
import { format } from 'date-fns';
import { FunctionComponent, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import usePageData from '@/hooks/usePageData';
import { multiplayerGamesInfo } from '@/shared/constants/multiplayerGamesInfo.constant';
import { multiplayerLobbyHighlights } from '@/shared/constants/multiplayerLobbyPage.constant';
import type { GameInfo } from '@/shared/types/types';
import { MultiplayerGameTypeEnum } from '@blockwinz/shared';

const games: GameInfo[] = Object.values(multiplayerGamesInfo);

/**
 * Hub page listing multiplayer titles with key info and a tab per game.
 */
const Lobbies: FunctionComponent = () => {
  const { setTitle } = usePageData();
  const [activeId, setActiveId] = useState<MultiplayerGameTypeEnum>(
    (games[0]?.id as MultiplayerGameTypeEnum) ??
      MultiplayerGameTypeEnum.TicTacToeGame,
  );

  const activeGame = useMemo(
    () => games.find((g) => g.id === activeId) ?? games[0],
    [activeId],
  );

  useEffect(() => {
    setTitle('Multiplayer lobbies · Blockwinz');
  }, [setTitle]);

  const highlights =
    activeGame &&
    multiplayerLobbyHighlights[activeGame.id as MultiplayerGameTypeEnum]
      ? multiplayerLobbyHighlights[activeGame.id as MultiplayerGameTypeEnum]
      : [];

  if (!activeGame) {
    return (
      <Box px={{ base: 4, md: 8 }} py={8}>
        <Text color='gray.400'>No multiplayer games available yet.</Text>
      </Box>
    );
  }

  return (
    <Box
      px={{ base: 4, md: 8 }}
      py={{ base: 4, md: 6 }}
      maxW='1100px'
      mx='auto'
      w='100%'>
      <Text
        fontSize='xs'
        fontWeight='600'
        color='gray.500'
        textTransform='uppercase'
        letterSpacing='0.08em'
        mb={1}>
        Multiplayer
      </Text>
      <Text fontSize='2xl' fontWeight='700' color='white' mb={1}>
        Lobbies
      </Text>
      <Text fontSize='sm' color='gray.400' mb={6} maxW='lg'>
        Pick a game to see how it works, then jump in—quick match, browse open
        tables, or host for friends.
      </Text>

      <Box
        w='100%'
        display='flex'
        flexWrap='wrap'
        gap='6px'
        bg='#000A27'
        borderRadius='10px'
        p='6px'
        borderWidth='1px'
        borderColor='whiteAlpha.300'
        mb={6}>
        {games.map((g) => {
          const id = g.id as MultiplayerGameTypeEnum;
          const active = activeId === id;
          return (
            <Button
              key={g.id}
              type='button'
              variant='ghost'
              flex={{ base: '1 1 calc(50% - 6px)', md: '1 1 auto' }}
              minW={{ md: '120px' }}
              h='42px'
              borderRadius='8px'
              onClick={() => setActiveId(id)}
              bg={active ? '#00DD25' : 'transparent'}
              color={active ? '#151832' : '#ECF0F1'}
              fontWeight='600'
              fontSize='sm'
              _hover={{
                bg: active ? '#00DD25' : 'rgba(255,255,255,0.08)',
              }}>
              {g.name}
            </Button>
          );
        })}
      </Box>

      <Box
        borderRadius='lg'
        borderWidth='1px'
        borderColor='whiteAlpha.200'
        bg='linear-gradient(145deg, rgba(10, 15, 40, 0.95) 0%, rgba(21, 24, 50, 0.98) 100%)'
        overflow='hidden'
        boxShadow='0 12px 40px rgba(0, 0, 0, 0.35)'>
        <HStack
          align='stretch'
          flexDir={{ base: 'column', md: 'row' }}
          gap={0}>
          <Box
            flex={{ base: 'none', md: '0 0 44%' }}
            minH={{ base: '200px', md: '280px' }}
            position='relative'
            bg='blackAlpha.500'>
            <Image
              src={activeGame.image}
              alt={activeGame.name}
              objectFit='cover'
              w='100%'
              h='100%'
              opacity={0.95}
            />
          </Box>
          <VStack align='stretch' gap={4} p={{ base: 5, md: 8 }} flex={1}>
            <Box>
              <HStack gap={3} mb={2} flexWrap='wrap'>
                <img
                  src={activeGame.icon}
                  alt=''
                  width={36}
                  height={36}
                  style={{ borderRadius: 8 }}
                  aria-hidden
                />
                <Text fontSize='xl' fontWeight='700' color='white'>
                  {activeGame.name}
                </Text>
              </HStack>
              {activeGame.releasedAt && (
                <Text fontSize='xs' color='gray.500' mb={3}>
                  Released {format(activeGame.releasedAt, 'MMMM yyyy')}
                </Text>
              )}
              <Text fontSize='sm' color='gray.300' lineHeight='tall' mb={4}>
                {activeGame.description.length > 320
                  ? `${activeGame.description.slice(0, 320)}…`
                  : activeGame.description}
              </Text>
            </Box>

            <Box>
              <Text
                fontSize='xs'
                fontWeight='600'
                color='gray.500'
                textTransform='uppercase'
                letterSpacing='0.06em'
                mb={2}>
                At a glance
              </Text>
              <VStack align='stretch' gap={2}>
                {highlights.map((line) => (
                  <HStack key={line} align='flex-start' gap={2}>
                    <Text as='span' color='#00DD25' fontSize='sm' lineHeight='1.4'>
                      •
                    </Text>
                    <Text fontSize='sm' color='gray.200' lineHeight='short'>
                      {line}
                    </Text>
                  </HStack>
                ))}
              </VStack>
            </Box>

            <Box pt={2}>
              <Link to={activeGame.link}>
                <Button
                  w={{ base: '100%', md: 'auto' }}
                  minW='200px'
                  h='48px'
                  bg='#00DD25'
                  color='#151832'
                  fontWeight='600'
                  fontSize='md'>
                  Play {activeGame.name}
                </Button>
              </Link>
            </Box>
          </VStack>
        </HStack>
      </Box>
    </Box>
  );
};

export default Lobbies;
