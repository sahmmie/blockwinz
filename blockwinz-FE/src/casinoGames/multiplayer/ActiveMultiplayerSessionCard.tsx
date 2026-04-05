import { Box, HStack, Text, VStack } from '@chakra-ui/react';
import { FunctionComponent } from 'react';
import { LobbyVisibility, MultiplayerSessionStatus } from '@blockwinz/shared';
import { Button } from '@/components/ui/button';
import useModal from '@/hooks/useModal';
import type { MultiplayerSessionRow } from './types';
import { MpPhase, RiskLevel } from '@/casinoGames/tictactoes/types';
import { parseFloatValue } from '@/shared/utils/common';

export interface ActiveMultiplayerSessionCardProps {
  session: MultiplayerSessionRow;
  mpPhase: MpPhase;
  userId: string | null | undefined;
  /** Board mark for the current user (e.g. X / O, or South / North for Quoridor). */
  userMark: string;
  /** When set, `turnLine` compares `currentTurn` to this user id instead of `userMark`. */
  turnUserId?: string | null;
  currentTurn: string;
  roundingDecimals: number;
  onLeaveLobby: () => void;
  /** Live match only: opens confirm, then resigns (opponent wins stakes). */
  onForfeitMatch?: () => void;
  /** Host in lobby: reopen invite modal (link, code, QR). */
  onShareRoomDetails?: () => void;
  leaveLobbyLoading?: boolean;
}

const ForfeitConfirmBody: FunctionComponent<{
  onConfirm: () => void;
  onCancel: () => void;
}> = ({ onConfirm, onCancel }) => (
  <VStack align='stretch' gap={4} py={2}>
    <Text fontSize='sm' color='gray.200' lineHeight='tall'>
      You will lose the match and your opponent receives both stakes (after rake,
      if any).
    </Text>
    <HStack gap={3} justify='flex-end'>
      <Button variant='outline' borderColor='whiteAlpha.400' onClick={onCancel}>
        Cancel
      </Button>
      <Button
        bg='#C53030'
        color='white'
        _hover={{ bg: '#9B2C2C' }}
        onClick={onConfirm}>
        Forfeit
      </Button>
    </HStack>
  </VStack>
);

const ActiveMultiplayerSessionCard: FunctionComponent<
  ActiveMultiplayerSessionCardProps
> = ({
  session,
  mpPhase,
  userId,
  userMark,
  turnUserId,
  currentTurn,
  roundingDecimals,
  onLeaveLobby,
  onForfeitMatch,
  onShareRoomDetails,
  leaveLobbyLoading,
}) => {
  const { openModal, closeModal } = useModal();

  const openForfeitConfirm = () => {
    if (!onForfeitMatch) return;
    openModal(
      <ForfeitConfirmBody
        onCancel={closeModal}
        onConfirm={() => {
          closeModal();
          onForfeitMatch();
        }}
      />,
      'Forfeit match?',
      {
        size: 'sm',
        hideCloseButton: false,
        width: { base: '92%', md: '400px' },
        backgroundColor: '#000A27',
        backdrop: true,
      },
    );
  };

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

  const isMyTurn =
    turnUserId != null && turnUserId !== ''
      ? Boolean(currentTurn && String(currentTurn) === String(turnUserId))
      : currentTurn === userMark;

  const turnLine =
    mpPhase === MpPhase.Playing
      ? !currentTurn
        ? 'Preparing the board…'
        : isMyTurn
          ? turnUserId != null && turnUserId !== ''
            ? 'Your turn — move or place a wall'
            : 'Your turn — place your mark'
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
        <VStack align='stretch' gap={2}>
          {onShareRoomDetails ? (
            <Button
              w='100%'
              size='lg'
              h='48px'
              bg='#00DD25'
              color='#151832'
              fontWeight='700'
              disabled={leaveLobbyLoading}
              onClick={() => onShareRoomDetails()}>
              Share room details
            </Button>
          ) : null}
          <Button
            w='100%'
            size='lg'
            h='48px'
            variant='outline'
            borderColor='whiteAlpha.400'
            color='#ECF0F1'
            fontWeight='600'
            loading={leaveLobbyLoading}
            loadingText='Leaving…'
            disabled={leaveLobbyLoading}
            onClick={() => void onLeaveLobby()}>
            Leave lobby
          </Button>
        </VStack>
      ) : mpPhase === MpPhase.Playing && onForfeitMatch ? (
        <VStack align='stretch' gap={2}>
          <Button
            w='100%'
            size='lg'
            h='48px'
            variant='outline'
            borderColor='rgba(197, 48, 48, 0.65)'
            color='#FC8181'
            fontWeight='600'
            _hover={{ bg: 'whiteAlpha.100', borderColor: '#C53030' }}
            onClick={openForfeitConfirm}>
            Forfeit match
          </Button>
          <Text fontSize='xs' color='gray.500' textAlign='center' lineHeight='short'>
            Resign and award the pot to your opponent.
          </Text>
        </VStack>
      ) : (
        <Text fontSize='xs' color='gray.500' textAlign='center' lineHeight='short'>
          Use the board to play. The match ends when someone wins or it&apos;s a draw.
        </Text>
      )}
    </VStack>
  );
};

export default ActiveMultiplayerSessionCard;
