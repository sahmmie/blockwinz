import { FunctionComponent } from 'react';
import { Text, VStack } from '@chakra-ui/react';
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

export interface RematchInviteModalProps {
  open: boolean;
  /** Completed session id the opponent wants to rematch from. */
  completedSessionId: string | null;
  fromUserId: string | null;
  isSubmitting: boolean;
  onAccept: () => void | Promise<void>;
  onDecline: () => void | Promise<void>;
}

/**
 * Prompts the invitee to accept or decline a rematch after the opponent tapped Rematch first.
 */
const RematchInviteModal: FunctionComponent<RematchInviteModalProps> = ({
  open,
  completedSessionId,
  fromUserId,
  isSubmitting,
  onAccept,
  onDecline,
}) => {
  return (
    <DialogRoot
      open={open && Boolean(completedSessionId && fromUserId)}
      closeOnInteractOutside={false}>
      <DialogContent>
        <DialogCloseTrigger onClick={() => void onDecline()} />
        <DialogHeader>
          <DialogTitle>Rematch request</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <VStack align='stretch' gap={3}>
            <Text fontSize='sm' color='fg.muted'>
              Your opponent wants a rematch on the same stake. Accept to start a
              new match, or decline to dismiss.
            </Text>
          </VStack>
        </DialogBody>
        <DialogFooter gap={2} flexWrap='wrap'>
          <Button
            variant='outline'
            disabled={isSubmitting}
            onClick={() => void onDecline()}>
            Decline
          </Button>
          <Button
            loading={isSubmitting}
            onClick={() => void onAccept()}
            bg='#00DD25'
            color='black'
            _hover={{ bg: '#00B01D' }}>
            Accept
          </Button>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  );
};

export default RematchInviteModal;
