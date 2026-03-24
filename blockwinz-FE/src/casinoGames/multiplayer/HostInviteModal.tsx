import {
  Box,
  HStack,
  Text,
  VStack,
} from '@chakra-ui/react';
import { FunctionComponent, useMemo } from 'react';
import QRCode from 'react-qr-code';
import {
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogHeader,
  DialogRoot,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toaster } from '@/components/ui/toaster';
import { LobbyVisibility } from '@blockwinz/shared';
import type { HostInviteInfo } from './types';
import { buildTictactoeInviteUrl, formatInvitePlainText } from './inviteLink';

function copyToClipboard(label: string, text: string) {
  void navigator.clipboard.writeText(text).then(
    () => {
      toaster.create({ title: 'Copied', description: label, type: 'success' });
    },
    () => {
      toaster.create({
        title: 'Copy failed',
        description: 'Select and copy manually.',
        type: 'error',
      });
    },
  );
}

export interface HostInviteModalProps {
  open: boolean;
  onClose: () => void;
  invite: HostInviteInfo | null;
}

const HostInviteModal: FunctionComponent<HostInviteModalProps> = ({
  open,
  onClose,
  invite,
}) => {
  const inviteUrl = useMemo(() => {
    if (!invite) return '';
    return buildTictactoeInviteUrl(invite.sessionId, {
      joinCode: invite.plaintextJoinCode,
    });
  }, [invite]);

  const fullText = useMemo(() => {
    if (!invite) return '';
    return formatInvitePlainText({
      gameLabel: 'Tic Tac Toe',
      betAmount: invite.betAmount,
      currency: invite.currency,
      sessionId: invite.sessionId,
      joinCode: invite.plaintextJoinCode,
      inviteUrl,
    });
  }, [invite, inviteUrl]);

  if (!invite) return null;

  return (
    <DialogRoot
      open={open}
      onOpenChange={({ open: isOpen }) => {
        if (!isOpen) onClose();
      }}
      placement='center'
      lazyMount
      size='lg'
      scrollBehavior='inside'
      unmountOnExit>
      <DialogContent maxW='min(100vw - 24px, 440px)' p={0}>
        <DialogCloseTrigger onClick={onClose} />
        <DialogHeader pb={2}>
          <DialogTitle fontSize='lg' color='white'>
            Your game is ready
          </DialogTitle>
          <Text fontSize='sm' color='gray.400' fontWeight='normal' mt={1}>
            Share the link or code so your opponent can join.
          </Text>
        </DialogHeader>
        <DialogBody px={5} pb={6} pt={0}>
          <VStack align='stretch' gap={4}>
            <Box
              borderRadius='md'
              borderWidth='1px'
              borderColor='whiteAlpha.200'
              bg='blackAlpha.400'
              px={3}
              py={2}>
              <Text fontSize='xs' color='gray.500' textTransform='uppercase' mb={1}>
                Stake
              </Text>
              <Text fontSize='md' fontWeight='700' color='white'>
                {invite.betAmount} {invite.currency.toUpperCase()}
              </Text>
              <Text fontSize='xs' color='gray.500' mt={2}>
                {invite.visibility === LobbyVisibility.PRIVATE
                  ? 'Private lobby'
                  : 'Public lobby'}
              </Text>
            </Box>

            <HStack gap={2} align='flex-start' flexWrap='wrap'>
              <Box
                flex='1'
                minW='120px'
                borderRadius='md'
                borderWidth='1px'
                borderColor='whiteAlpha.200'
                bg='blackAlpha.400'
                px={3}
                py={2}>
                <Text fontSize='xs' color='gray.500' mb={1}>
                  Session ID
                </Text>
                <Text
                  fontSize='xs'
                  color='gray.200'
                  wordBreak='break-all'
                  fontFamily='mono'>
                  {invite.sessionId}
                </Text>
              </Box>
              {invite.visibility === LobbyVisibility.PRIVATE &&
                invite.plaintextJoinCode && (
                <Box
                  flex='1'
                  minW='120px'
                  borderRadius='md'
                  borderWidth='1px'
                  borderColor='whiteAlpha.200'
                  bg='blackAlpha.400'
                  px={3}
                  py={2}>
                  <Text fontSize='xs' color='gray.500' mb={1}>
                    Join code
                  </Text>
                  <Text fontSize='md' fontWeight='700' color='white' fontFamily='mono'>
                    {invite.plaintextJoinCode}
                  </Text>
                </Box>
              )}
            </HStack>

            <HStack gap={2} flexWrap='wrap'>
              <Button
                size='sm'
                variant='outline'
                borderColor='whiteAlpha.300'
                onClick={() =>
                  copyToClipboard('Session ID', invite.sessionId)
                }>
                Copy session ID
              </Button>
              {invite.visibility === LobbyVisibility.PRIVATE &&
                invite.plaintextJoinCode && (
                <Button
                  size='sm'
                  variant='outline'
                  borderColor='whiteAlpha.300'
                  onClick={() =>
                    copyToClipboard('Join code', invite.plaintextJoinCode!)
                  }>
                  Copy code
                </Button>
              )}
              <Button
                size='sm'
                bg='#00DD25'
                color='#151832'
                onClick={() => copyToClipboard('Full invite', fullText)}>
                Copy full invite
              </Button>
            </HStack>

            <Box>
              <Text fontSize='xs' color='gray.500' mb={2}>
                Invite link
              </Text>
              <Text
                fontSize='xs'
                color='gray.300'
                wordBreak='break-all'
                lineHeight='short'
                mb={2}>
                {inviteUrl}
              </Text>
              <HStack gap={2} flexWrap='wrap'>
                <Button
                  size='sm'
                  variant='outline'
                  borderColor='whiteAlpha.300'
                  onClick={() => copyToClipboard('Invite link', inviteUrl)}>
                  Copy link
                </Button>
                {typeof navigator !== 'undefined' &&
                  typeof navigator.share === 'function' && (
                    <Button
                      size='sm'
                      variant='ghost'
                      color='gray.300'
                      onClick={() => {
                        void navigator
                          .share({
                            title: 'Join my Tic Tac Toe game',
                            url: inviteUrl,
                          })
                          .catch(() => {
                            copyToClipboard('Invite link', inviteUrl);
                          });
                      }}>
                      Share…
                    </Button>
                  )}
              </HStack>
            </Box>

            <VStack align='center' gap={2} py={2}>
              <Text fontSize='xs' color='gray.500'>
                Scan to open
              </Text>
              <Box
                p={3}
                bg='white'
                borderRadius='md'
                display='inline-block'>
                <QRCode value={inviteUrl} size={160} level='M' />
              </Box>
            </VStack>

            <Button w='100%' variant='outline' borderColor='whiteAlpha.400' onClick={onClose}>
              Done
            </Button>
          </VStack>
        </DialogBody>
      </DialogContent>
    </DialogRoot>
  );
};

export default HostInviteModal;
