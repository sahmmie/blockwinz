import { Box, HStack, Spinner, Text, VStack } from '@chakra-ui/react';
import { FunctionComponent } from 'react';
import { LobbyVisibility } from '@blockwinz/shared';
import {
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import MultiplayerTextField from './MultiplayerTextField';
import type { MultiplayerSessionRow } from './types';
import { getJoinLobbyBlockReason, shortHostLabel } from './lobbyJoinRules';

export type JoinLobbyConfirmPayload =
  | { kind: 'public'; lobby: MultiplayerSessionRow }
  | {
      kind: 'private';
      sessionId: string;
      joinCode: string;
      /** True when list lookup says public (or unknown) — no join code row in confirm. */
      hideJoinCodeInConfirm?: boolean;
    }
  /** Deep link, lobby hub, or paste flow before we have a full lobby row. */
  | {
      kind: 'invite';
      sessionId: string;
      joinCode?: string;
      source?: 'url' | 'hub';
      /** Deep link only: show join code field when URL has no `code` and we know the table is private. */
      requiresJoinCodeInput?: boolean;
      /** When the session appears on the public list (or hub resolved it). */
      tableBetAmount?: number;
      tableCurrency?: string;
    };

export interface JoinLobbyConfirmModalProps {
  open: boolean;
  onClose: () => void;
  payload: JoinLobbyConfirmPayload | null;
  viewerCurrency: string;
  viewerStake: number;
  roundingDecimals: number;
  isSubmitting: boolean;
  onConfirmJoin: () => void | Promise<void>;
  /** Deep-link invite: controlled join code when `requiresJoinCodeInput` is set. */
  inviteJoinCodeDraft?: string;
  onInviteJoinCodeDraftChange?: (value: string) => void;
  /** Join-by-code modal: stake from lobby list lookup. */
  resolvedPrivateStake?: { amount: number; currency: string } | null;
  privateStakeLoading?: boolean;
}

const JoinLobbyConfirmModal: FunctionComponent<JoinLobbyConfirmModalProps> = ({
  open,
  onClose,
  payload,
  viewerCurrency,
  viewerStake,
  roundingDecimals,
  isSubmitting,
  onConfirmJoin,
  inviteJoinCodeDraft = '',
  onInviteJoinCodeDraftChange = () => {},
  resolvedPrivateStake = null,
  privateStakeLoading = false,
}) => {
  if (!payload) return null;

  const blockReason =
    payload.kind === 'public'
      ? getJoinLobbyBlockReason(
          payload.lobby,
          viewerCurrency,
          viewerStake,
        )
      : null;

  const inviteNeedsTypedCode =
    payload.kind === 'invite' &&
    payload.source === 'url' &&
    payload.requiresJoinCodeInput &&
    !payload.joinCode?.trim();

  const canJoin =
    payload.kind === 'public'
      ? !blockReason
      : inviteNeedsTypedCode
        ? Boolean(inviteJoinCodeDraft.trim())
        : true;

  const showInviteCodeField = Boolean(inviteNeedsTypedCode);

  const max =
    payload.kind === 'public' ? payload.lobby.maxPlayers ?? 2 : undefined;
  const count =
    payload.kind === 'public' ? payload.lobby.players?.length ?? 0 : undefined;

  const visibilityLabel =
    payload.kind === 'public'
      ? payload.lobby.visibility === LobbyVisibility.PRIVATE
        ? 'Private'
        : 'Public'
      : payload.kind === 'private'
        ? payload.hideJoinCodeInConfirm
          ? 'Public'
          : 'Private'
        : 'Invite link';

  const stakeRow = (() => {
    if (payload.kind === 'public') {
      return {
        line: `${Number(payload.lobby.betAmount).toFixed(roundingDecimals)}\u00A0${payload.lobby.currency.toUpperCase()}`,
        loading: false,
        unknown: false,
      };
    }
    if (payload.kind === 'invite') {
      if (
        payload.tableBetAmount != null &&
        payload.tableCurrency != null &&
        payload.tableCurrency !== ''
      ) {
        return {
          line: `${Number(payload.tableBetAmount).toFixed(roundingDecimals)}\u00A0${String(payload.tableCurrency).toUpperCase()}`,
          loading: false,
          unknown: false,
        };
      }
      return { line: '—', loading: false, unknown: true };
    }
    if (privateStakeLoading) {
      return { line: '', loading: true, unknown: false };
    }
    if (
      resolvedPrivateStake &&
      resolvedPrivateStake.currency &&
      Number.isFinite(resolvedPrivateStake.amount)
    ) {
      return {
        line: `${Number(resolvedPrivateStake.amount).toFixed(roundingDecimals)}\u00A0${resolvedPrivateStake.currency.toUpperCase()}`,
        loading: false,
        unknown: false,
      };
    }
    return { line: '—', loading: false, unknown: true };
  })();

  return (
    <DialogRoot
      open={open}
      onOpenChange={({ open: isOpen }) => {
        if (!isOpen) onClose();
      }}
      placement='center'
      lazyMount
      size='md'
      scrollBehavior='inside'
      unmountOnExit>
      <DialogContent
        maxW='min(100vw - 24px, 440px)'
        p={0}
        bg='#151832'
        borderWidth='1px'
        borderColor='whiteAlpha.200'>
        <DialogHeader px={6} pt={6} pb={0}>
          <DialogTitle fontSize='lg' fontWeight='700' color='white'>
            Join this table?
          </DialogTitle>
          <DialogCloseTrigger />
        </DialogHeader>
        <DialogBody px={6} pt={3} pb={2}>
          <VStack align='stretch' gap={3}>
            <HStack justify='space-between' gap={3}>
              <Text fontSize='sm' color='gray.400'>
                Game
              </Text>
              <Text fontSize='sm' fontWeight='600' color='white' textAlign='right'>
                Tic Tac Toe
              </Text>
            </HStack>

            <HStack justify='space-between' gap={3}>
              <Text fontSize='sm' color='gray.400'>
                Visibility
              </Text>
              <Text fontSize='sm' color='gray.200' textAlign='right'>
                {visibilityLabel} lobby
              </Text>
            </HStack>

            <HStack justify='space-between' gap={3} align='flex-start'>
              <Text fontSize='sm' color='gray.400' flexShrink={0}>
                Stake
              </Text>
              <HStack gap={2} justify='flex-end' minH='20px'>
                {stakeRow.loading ? (
                  <Spinner size='sm' color='#00DD25' />
                ) : (
                  <Text
                    fontSize='sm'
                    fontWeight='700'
                    color='white'
                    textAlign='right'
                    whiteSpace='nowrap'>
                    {stakeRow.line}
                  </Text>
                )}
              </HStack>
            </HStack>
            {stakeRow.unknown ? (
              <Text fontSize='xs' color='gray.500' lineHeight='short'>
                Stake is set by the host; your balance is checked when you join.
              </Text>
            ) : null}
            {payload.kind === 'public' && payload.lobby.betAmountMustEqual ? (
              <Text fontSize='xs' color='gray.500' lineHeight='short'>
                Exact stake: your amount in the panel above must match this
                table before you can join.
              </Text>
            ) : null}

            {payload.kind === 'public' ? (
              <>
                <HStack justify='space-between' gap={3}>
                  <Text fontSize='sm' color='gray.400'>
                    Host
                  </Text>
                  <Text
                    fontSize='sm'
                    color='gray.200'
                    textAlign='right'
                    fontFamily='mono'>
                    {shortHostLabel(payload.lobby.hostUserId)}
                  </Text>
                </HStack>
                <HStack justify='space-between' gap={3}>
                  <Text fontSize='sm' color='gray.400'>
                    Seats
                  </Text>
                  <Text fontSize='sm' color='gray.200' textAlign='right'>
                    {count}/{max}
                  </Text>
                </HStack>
              </>
            ) : payload.kind === 'private' ? (
              <>
                <Text fontSize='xs' color='gray.500' lineHeight='short'>
                  {payload.hideJoinCodeInConfirm
                    ? "You're joining a public table with this session ID. Your wallet will be checked for the table stake when you confirm."
                    : "You're joining with a session ID and code from the host. Your wallet will be checked for the table stake when you confirm."}
                </Text>
                <HStack justify='space-between' gap={3} align='flex-start'>
                  <Text fontSize='sm' color='gray.400' flexShrink={0}>
                    Session
                  </Text>
                  <Text
                    fontSize='xs'
                    color='gray.200'
                    textAlign='right'
                    fontFamily='mono'
                    wordBreak='break-all'>
                    {payload.sessionId}
                  </Text>
                </HStack>
                {!payload.hideJoinCodeInConfirm ? (
                  <HStack justify='space-between' gap={3}>
                    <Text fontSize='sm' color='gray.400'>
                      Join code
                    </Text>
                    <Text
                      fontSize='sm'
                      color='gray.200'
                      textAlign='right'
                      fontFamily='mono'>
                      {payload.joinCode}
                    </Text>
                  </HStack>
                ) : null}
              </>
            ) : (
              <>
                <Text fontSize='xs' color='gray.500' lineHeight='short'>
                  {payload.source === 'hub'
                    ? 'You picked this table from the lobby hub. The server will verify the stake and seat you when you confirm.'
                    : 'You opened a multiplayer link. Confirm to join — your wallet will be checked for the table stake.'}
                </Text>
                <HStack justify='space-between' gap={3} align='flex-start'>
                  <Text fontSize='sm' color='gray.400' flexShrink={0}>
                    Session
                  </Text>
                  <Text
                    fontSize='xs'
                    color='gray.200'
                    textAlign='right'
                    fontFamily='mono'
                    wordBreak='break-all'>
                    {payload.sessionId}
                  </Text>
                </HStack>
                {showInviteCodeField ? (
                  <MultiplayerTextField
                    label='Join code'
                    value={inviteJoinCodeDraft}
                    placeholder='Enter the code from the host'
                    showPasteButton
                    onChange={onInviteJoinCodeDraftChange}
                  />
                ) : (
                  <HStack justify='space-between' gap={3}>
                    <Text fontSize='sm' color='gray.400'>
                      Join code
                    </Text>
                    <Text
                      fontSize='sm'
                      color='gray.200'
                      textAlign='right'
                      fontFamily='mono'>
                      {payload.joinCode?.trim()
                        ? payload.joinCode
                        : '— (not required for public tables)'}
                    </Text>
                  </HStack>
                )}
              </>
            )}

            <Box
              borderRadius='md'
              borderWidth='1px'
              borderColor='whiteAlpha.150'
              bg='blackAlpha.400'
              px={3}
              py={2}>
              <Text fontSize='xs' color='gray.400' lineHeight='short'>
                Joining commits you to this table&apos;s rules. You can leave
                from the lobby before the match starts unless the host has
                already started play.
              </Text>
            </Box>

            {blockReason ? (
              <Box
                borderRadius='md'
                borderWidth='1px'
                borderColor='orange.400'
                bg='blackAlpha.500'
                px={3}
                py={2}>
                <Text fontSize='xs' color='orange.200' lineHeight='short'>
                  {blockReason}
                </Text>
              </Box>
            ) : null}
          </VStack>
        </DialogBody>
        <DialogFooter px={6} pb={6} pt={2} gap={3} flexWrap='wrap'>
          <Button
            variant='outline'
            borderColor='whiteAlpha.400'
            color='gray.200'
            flex={{ base: '1 1 100%', sm: '0 1 auto' }}
            minW={{ sm: '120px' }}
            disabled={isSubmitting}
            onClick={onClose}>
            Leave
          </Button>
          <Button
            bg='#00DD25'
            color='#151832'
            fontWeight='700'
            flex={{ base: '1 1 100%', sm: '1 1 auto' }}
            minW={{ sm: '140px' }}
            loading={isSubmitting}
            disabled={!canJoin || isSubmitting}
            onClick={() => void onConfirmJoin()}>
            Join table
          </Button>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  );
};

export default JoinLobbyConfirmModal;
