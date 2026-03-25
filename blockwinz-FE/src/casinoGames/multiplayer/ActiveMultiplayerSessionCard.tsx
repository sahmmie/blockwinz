import { Box, HStack, Text, VStack } from '@chakra-ui/react';
import { FunctionComponent } from 'react';
import { LobbyVisibility, MultiplayerSessionStatus } from '@blockwinz/shared';
import { Button } from '@/components/ui/button';
import type { MultiplayerSessionRow } from './types';
import { MpPhase, RiskLevel } from '@/casinoGames/tictactoes/types';
import { parseFloatValue } from '@/shared/utils/common';

export interface ActiveMultiplayerSessionCardProps {
  session: MultiplayerSessionRow;
  mpPhase: MpPhase;
  userId: string | null | undefined;
  /** Board mark for the current user (e.g. X / O). */
  userMark: string;
  currentTurn: string;
  roundingDecimals: number;
  onLeaveLobby: () => void;
}

const ActiveMultiplayerSessionCard: FunctionComponent<
  ActiveMultiplayerSessionCardProps
> = ({
  session,
  mpPhase,
  userId,
  userMark,
  currentTurn,
  roundingDecimals,
  onLeaveLobby,
}) => {
  const stake = Number(session.betAmount);
  const profitIfWin = stake * parseFloatValue(RiskLevel.MEDIUM);
  const cur = session.currency.toUpperCase();
  const players = session.players ?? [];
  const maxPlayers = session.maxPlayers ?? 2;
  const isHost =
    Boolean(userId && session.hostUserId && userId === session.hostUserId);

  const visibilityLabel =
    session.visibility === LobbyVisibility.PRIVATE ? 'Private' : 'Public';

  const sessionShort = `${session._id.slice(0, 8)}…`;

  const lobbyStatus =
    players.length >= maxPlayers
      ? 'Ready — match will start soon'
      : `Waiting for opponent (${players.length}/${maxPlayers})`;

  const turnLine =
    mpPhase === MpPhase.Playing
      ? !currentTurn
        ? 'Preparing the board…'
        : userId && currentTurn === userId
          ? 'Your turn — place your mark'
          : "Opponent's turn"
      : null;

  return (
    <VStack align='stretch' gap={4}>
      <Box
        borderRadius='lg'
        borderWidth='1px'
        borderColor='rgba(0, 221, 37, 0.35)'
        bg='blackAlpha.500'
        px={4}
        py={4}>
        <Text
          fontSize='xs'
          fontWeight='700'
          color='#00DD25'
          textTransform='uppercase'
          letterSpacing='0.08em'
          mb={3}>
          Active game
        </Text>

        <VStack align='stretch' gap={3}>
          <HStack justify='space-between' align='flex-start' gap={3}>
            <Text fontSize='sm' color='gray.400'>
              Status
            </Text>
            <Text fontSize='sm' color='gray.100' textAlign='right' fontWeight='600'>
              {mpPhase === MpPhase.Lobby ? lobbyStatus : 'Live match'}
            </Text>
          </HStack>

          <HStack justify='space-between' align='flex-start' gap={3}>
            <Text fontSize='sm' color='gray.400'>
              Table stake
            </Text>
            <Text fontSize='sm' color='white' textAlign='right' fontWeight='700'>
              {stake.toFixed(roundingDecimals)} {cur}
            </Text>
          </HStack>

          <HStack justify='space-between' align='flex-start' gap={3}>
            <Text fontSize='sm' color='gray.400'>
              Profit if you win
            </Text>
            <Text fontSize='sm' color='gray.200' textAlign='right'>
              +{profitIfWin.toFixed(roundingDecimals)} {cur}
            </Text>
          </HStack>

          <HStack justify='space-between' align='flex-start' gap={3}>
            <Text fontSize='sm' color='gray.400'>
              Role
            </Text>
            <Text fontSize='sm' color='gray.200' textAlign='right'>
              {isHost ? 'Host' : 'Guest'} · {visibilityLabel} lobby
            </Text>
          </HStack>

          <HStack justify='space-between' align='flex-start' gap={3}>
            <Text fontSize='sm' color='gray.400'>
              Session
            </Text>
            <Text
              fontSize='xs'
              color='gray.300'
              textAlign='right'
              fontFamily='mono'
              wordBreak='break-all'>
              {sessionShort}
            </Text>
          </HStack>

          {mpPhase === MpPhase.Playing && userMark ? (
            <Box
              pt={1}
              borderTopWidth='1px'
              borderColor='whiteAlpha.150'>
              <Text fontSize='sm' color='gray.300' mb={1}>
                You are <Text as='span' fontWeight='700' color='white'>{userMark}</Text>
              </Text>
              {turnLine && (
                <Text fontSize='sm' color='#00DD25' fontWeight='600'>
                  {turnLine}
                </Text>
              )}
            </Box>
          ) : null}

          {session.gameStatus === MultiplayerSessionStatus.PENDING &&
            session.betAmountMustEqual ? (
            <Text fontSize='xs' color='gray.500' lineHeight='short'>
              Exact-stake table — amounts must match the host.
            </Text>
          ) : null}
        </VStack>
      </Box>

      {mpPhase === MpPhase.Lobby ? (
        <Button
          w='100%'
          size='lg'
          h='48px'
          variant='outline'
          borderColor='whiteAlpha.400'
          color='#ECF0F1'
          fontWeight='600'
          onClick={() => onLeaveLobby()}>
          Leave lobby
        </Button>
      ) : (
        <Text fontSize='xs' color='gray.500' textAlign='center' lineHeight='short'>
          Use the board to play. The match ends when someone wins or it&apos;s a draw.
        </Text>
      )}
    </VStack>
  );
};

export default ActiveMultiplayerSessionCard;
