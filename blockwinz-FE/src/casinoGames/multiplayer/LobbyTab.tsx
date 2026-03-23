import { Box, HStack, Text, VStack } from '@chakra-ui/react';
import { FunctionComponent } from 'react';
import { Button } from '@/components/ui/button';
import type { MultiplayerSessionRow } from './types';
import { getJoinLobbyBlockReason, shortHostLabel } from './lobbyJoinRules';

interface LobbyTabProps {
  lobbies: MultiplayerSessionRow[];
  viewerCurrency: string;
  viewerStake: number;
  isLoading: boolean;
  onRefresh: () => void;
  onJoin: (sessionId: string) => void;
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
  return (
    <Box>
      <HStack justify='space-between' align='center' mb={3}>
        <Text fontSize='xs' fontWeight='600' color='gray.500' textTransform='uppercase' letterSpacing='0.06em'>
          Open lobbies
        </Text>
        <Button
          size='xs'
          variant='outline'
          borderColor='whiteAlpha.300'
          onClick={() => onRefresh()}
          loading={isLoading}>
          Refresh
        </Button>
      </HStack>
      {lobbies.length === 0 ? (
        <Box
          borderRadius='md'
          borderWidth='1px'
          borderStyle='dashed'
          borderColor='whiteAlpha.200'
          py={8}
          px={4}
          textAlign='center'>
          <Text fontSize='sm' color='gray.400' mb={1}>
            No public lobbies yet
          </Text>
          <Text fontSize='xs' color='gray.500'>
            Try Quick Match or host a game in the Host tab.
          </Text>
        </Box>
      ) : (
        <VStack gap={2} align='stretch' maxH='280px' overflowY='auto' pr={1}>
          {lobbies.map((lobby) => {
            const max = lobby.maxPlayers ?? 2;
            const count = lobby.players?.length ?? 0;
            const block = getJoinLobbyBlockReason(
              lobby,
              viewerCurrency,
              viewerStake,
            );
            const disabled = Boolean(block);
            return (
              <Box
                key={lobby._id}
                borderRadius='md'
                borderWidth='1px'
                borderColor='whiteAlpha.150'
                bg='blackAlpha.400'
                px={3}
                py={2.5}
                transition='border-color 0.15s ease'
                _hover={{ borderColor: 'whiteAlpha.300' }}>
                <HStack justify='space-between' align='center' gap={3}>
                  <VStack align='flex-start' gap={0}>
                    <Text fontSize='sm' fontWeight='600' color='white' lineHeight='short'>
                      {shortHostLabel(lobby.hostUserId)}
                    </Text>
                    <HStack gap={2} flexWrap='wrap'>
                      <Text fontSize='xs' color='gray.400'>
                        Stake{' '}
                        <Text as='span' color='gray.200' fontWeight='600'>
                          {lobby.betAmount} {lobby.currency.toUpperCase()}
                        </Text>
                      </Text>
                      <Text fontSize='xs' color='gray.500'>
                        {count}/{max} players
                      </Text>
                    </HStack>
                  </VStack>
                  <Button
                    size='sm'
                    flexShrink={0}
                    bg={disabled ? undefined : '#00DD25'}
                    color={disabled ? undefined : '#151832'}
                    variant={disabled ? 'outline' : 'solid'}
                    disabled={disabled}
                    title={block ?? undefined}
                    onClick={() => onJoin(lobby._id)}>
                    Join
                  </Button>
                </HStack>
              </Box>
            );
          })}
        </VStack>
      )}
      {lobbies.some((l) =>
        getJoinLobbyBlockReason(l, viewerCurrency, viewerStake),
      ) && (
        <Text fontSize='xs' color='gray.500' mt={3} lineHeight='short'>
          Some rows are disabled until your currency and stake match the lobby (preview only).
        </Text>
      )}
    </Box>
  );
};

export default LobbyTab;
