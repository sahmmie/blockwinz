import { Badge, Box, HStack, Text, VStack } from '@chakra-ui/react';
import { FunctionComponent } from 'react';
import { Button } from '@/components/ui/button';
import TicTacToeIcon from '@/assets/icons/tic-tac-toe-icon.svg';
import type { MultiplayerSessionRow } from './types';
import { getJoinLobbyBlockReason, shortHostLabel } from './lobbyJoinRules';

interface LobbyTabProps {
  lobbies: MultiplayerSessionRow[];
  viewerCurrency: string;
  viewerStake: number;
  isLoading: boolean;
  onRefresh: () => void;
  onJoin: (lobby: MultiplayerSessionRow) => void;
}

/**
 * Browse public lobbies with Join actions (UI-only join gating).
 */
const LobbyTab: FunctionComponent<LobbyTabProps> = ({
  lobbies,
  viewerCurrency,
  viewerStake,
  isLoading,
  onRefresh,
  onJoin,
}) => {
  const showWalletHint =
    lobbies.length > 0 &&
    lobbies.some((l) => getJoinLobbyBlockReason(l, viewerCurrency, viewerStake));

  return (
    <Box>
      <HStack justify='space-between' align='center' mb={2} gap={3}>
        <Text
          fontSize='xs'
          fontWeight='700'
          color='gray.400'
          textTransform='uppercase'
          letterSpacing='0.08em'>
          Open tables
        </Text>
        <Button
          size='xs'
          variant='outline'
          borderColor='whiteAlpha.300'
          flexShrink={0}
          onClick={() => onRefresh()}
          loading={isLoading}>
          Refresh
        </Button>
      </HStack>

      {showWalletHint && (
        <Box
          borderRadius='md'
          borderWidth='1px'
          borderColor='whiteAlpha.150'
          bg='blackAlpha.400'
          px={3}
          py={2}
          mb={3}>
          <Text fontSize='xs' color='gray.400' lineHeight='short'>
            Some tables need your wallet currency and stake to match before you
            can join. Adjust the stake above or switch token.
          </Text>
        </Box>
      )}

      {lobbies.length === 0 ? (
        <Box
          borderRadius='lg'
          borderWidth='1px'
          borderStyle='dashed'
          borderColor='whiteAlpha.200'
          bg='blackAlpha.350'
          py={6}
          px={4}
          textAlign='center'>
          <Box
            mx='auto'
            mb={3}
            w='52px'
            h='52px'
            borderRadius='xl'
            bg='#151832'
            borderWidth='1px'
            borderColor='whiteAlpha.150'
            display='flex'
            alignItems='center'
            justifyContent='center'>
            <img src={TicTacToeIcon} alt='' width={28} height={28} aria-hidden />
          </Box>
          <Text fontSize='sm' fontWeight='600' color='gray.200' mb={1}>
            No public tables open
          </Text>
          <Text fontSize='xs' color='gray.500' lineHeight='tall' maxW='240px' mx='auto'>
            Host a game from the Host tab or use Find match — new lobbies show up
            here when players create them.
          </Text>
        </Box>
      ) : (
        <VStack
          gap={1.5}
          align='stretch'
          maxH='min(38vh, 240px)'
          overflowY='auto'
          pr={1}
          css={{
            scrollbarGutter: 'stable',
            '&::-webkit-scrollbar': { width: '6px' },
            '&::-webkit-scrollbar-thumb': {
              background: 'rgba(255,255,255,0.15)',
              borderRadius: '6px',
            },
          }}>
          {lobbies.map((lobby) => {
            const max = lobby.maxPlayers ?? 2;
            const count = lobby.players?.length ?? 0;
            const openSlots = Math.max(0, max - count);
            const hasOpenSeat = lobby.gameStatus === 'pending' && openSlots > 0;
            const block = getJoinLobbyBlockReason(
              lobby,
              viewerCurrency,
              viewerStake,
            );
            const disabled = Boolean(block);
            const cur = lobby.currency.toUpperCase();

            return (
              <Box
                key={lobby._id}
                role='group'
                borderRadius='sm'
                borderWidth='1px'
                borderColor='whiteAlpha.180'
                bg='linear-gradient(145deg, rgba(21, 24, 50, 0.95) 0%, rgba(0, 10, 39, 0.65) 100%)'
                px={2}
                py={1.5}
                transition='border-color 0.2s ease, box-shadow 0.2s ease'
                _hover={{
                  borderColor: 'rgba(0, 221, 37, 0.35)',
                  boxShadow: '0 0 0 1px rgba(0, 221, 37, 0.12)',
                }}>
                <HStack align='center' justify='space-between' gap={2} flexWrap='wrap'>
                  <HStack align='center' gap={1.5} flex={1} minW='min(100%, 140px)'>
                    <Box
                      flexShrink={0}
                      w='26px'
                      h='26px'
                      borderRadius='sm'
                      bg='#151832'
                      borderWidth='1px'
                      borderColor='whiteAlpha.200'
                      display='flex'
                      alignItems='center'
                      justifyContent='center'
                      transition='border-color 0.2s ease, box-shadow 0.2s ease'
                      _groupHover={{
                        borderColor: 'whiteAlpha.280',
                        boxShadow: '0 0 0 1px rgba(255,255,255,0.06)',
                      }}>
                      <img
                        src={TicTacToeIcon}
                        alt=''
                        width={15}
                        height={15}
                        aria-hidden
                      />
                    </Box>
                    <VStack align='flex-start' gap={0.5} minW={0} flex={1}>
                      <HStack gap={1} flexWrap='wrap' align='center' lineHeight={1.2}>
                        <Text
                          fontSize='11px'
                          fontWeight='700'
                          color='white'
                          letterSpacing='-0.02em'>
                          Tic Tac Toe
                        </Text>
                        <Badge
                          bg={
                            hasOpenSeat
                              ? 'rgba(0, 221, 37, 0.12)'
                              : 'whiteAlpha.120'
                          }
                          color={hasOpenSeat ? '#00DD25' : 'gray.400'}
                          fontSize='9px'
                          px={1}
                          py={0}
                          borderRadius='sm'
                          fontWeight='700'
                          borderWidth='1px'
                          borderColor={
                            hasOpenSeat
                              ? 'rgba(0, 221, 37, 0.22)'
                              : 'whiteAlpha.100'
                          }
                          fontVariantNumeric='tabular-nums'>
                          {count}/{max}
                        </Badge>
                        {lobby.betAmountMustEqual ? (
                          <Badge
                            bg='whiteAlpha.080'
                            color='gray.500'
                            fontSize='9px'
                            px={1}
                            py={0}
                            borderRadius='sm'
                            fontWeight='600'
                            borderWidth='1px'
                            borderColor='whiteAlpha.060'>
                            Exact stake
                          </Badge>
                        ) : null}
                      </HStack>
                      <HStack
                        gap={1}
                        minW={0}
                        w='100%'
                        align='baseline'
                        lineHeight='short'>
                        <Text
                          as='span'
                          fontSize='9px'
                          fontWeight='600'
                          color='gray.600'
                          textTransform='uppercase'
                          letterSpacing='0.06em'
                          flexShrink={0}>
                          Host
                        </Text>
                        <Text
                          as='span'
                          fontSize='10px'
                          fontWeight='500'
                          color='gray.200'
                          minW={0}
                          flex={1}
                          overflow='hidden'
                          textOverflow='ellipsis'
                          whiteSpace='nowrap'
                          title={lobby.hostUserId ?? undefined}>
                          {shortHostLabel(lobby.hostUserId)}
                        </Text>
                      </HStack>
                      <HStack
                        gap={1}
                        minW={0}
                        w='100%'
                        align='baseline'
                        lineHeight='short'>
                        <Text
                          as='span'
                          fontSize='9px'
                          fontWeight='600'
                          color='gray.600'
                          textTransform='uppercase'
                          letterSpacing='0.06em'
                          flexShrink={0}>
                          Stake
                        </Text>
                        <Text
                          as='span'
                          fontSize='10px'
                          fontWeight='600'
                          color='gray.100'
                          fontVariantNumeric='tabular-nums'
                          whiteSpace='nowrap'>
                          {lobby.betAmount}
                          {'\u00A0'}
                          {cur}
                        </Text>
                      </HStack>
                    </VStack>
                  </HStack>

                  <Button
                    flexShrink={0}
                    w={{ base: '100%', sm: 'auto' }}
                    minW={{ sm: '72px' }}
                    h='28px'
                    size='xs'
                    bg={disabled ? undefined : '#00DD25'}
                    color={disabled ? undefined : '#151832'}
                    variant={disabled ? 'outline' : 'solid'}
                    borderColor={disabled ? 'whiteAlpha.300' : undefined}
                    fontWeight='700'
                    fontSize='11px'
                    transition='filter 0.15s ease, border-color 0.15s ease'
                    _groupHover={
                      disabled
                        ? undefined
                        : { filter: 'brightness(1.06)' }
                    }
                    title={block ?? 'Review table details before joining'}
                    aria-label={`Join Tic Tac Toe table, ${lobby.betAmount} ${cur}`}
                    onClick={() => onJoin(lobby)}>
                    Join
                  </Button>
                </HStack>
              </Box>
            );
          })}
        </VStack>
      )}
    </Box>
  );
};

export default LobbyTab;
