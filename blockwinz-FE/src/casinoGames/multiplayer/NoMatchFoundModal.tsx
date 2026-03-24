import { Text, VStack } from '@chakra-ui/react';
import { FunctionComponent } from 'react';
import { Button } from '@/components/ui/button';
import {
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
} from '@/components/ui/dialog';

export interface NoMatchFoundModalProps {
  open: boolean;
  /** Called when the dialog should close (backdrop, X, or after an action). */
  onOpenChange: (open: boolean) => void;
  onTryAgain: () => void;
  onBrowseLobbies: () => void;
}

/**
 * Shown when quick match times out without pairing (server queue cleared in hook).
 */
const NoMatchFoundModal: FunctionComponent<NoMatchFoundModalProps> = ({
  open,
  onOpenChange,
  onTryAgain,
  onBrowseLobbies,
}) => {
  return (
    <DialogRoot
      open={open}
      onOpenChange={({ open: next }) => onOpenChange(next)}
      placement='center'
      lazyMount
      size='sm'>
      <DialogContent
        maxW='min(100vw - 24px, 380px)'
        p={0}
        bg='#151832'
        borderWidth='1px'
        borderColor='whiteAlpha.200'>
        <DialogCloseTrigger />
        <DialogHeader pb={0} pt={6} px={6}>
          <DialogTitle fontSize='lg' color='white'>
            No match found
          </DialogTitle>
        </DialogHeader>
        <DialogBody px={6} pt={3} pb={2}>
          <Text fontSize='sm' color='gray.400' lineHeight='tall'>
            No opponent found. Try again or browse lobbies.
          </Text>
        </DialogBody>
        <DialogFooter px={6} pb={6} pt={2} flexDirection='column' gap={2}>
          <VStack w='100%' gap={2}>
            <Button
              w='100%'
              size='lg'
              h='48px'
              bg='#00DD25'
              color='#151832'
              fontWeight='600'
              onClick={() => onTryAgain()}>
              Try again
            </Button>
            <Button
              w='100%'
              size='lg'
              h='48px'
              variant='outline'
              borderColor='whiteAlpha.400'
              color='#ECF0F1'
              fontWeight='600'
              onClick={() => onBrowseLobbies()}>
              Browse lobbies
            </Button>
          </VStack>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  );
};

export default NoMatchFoundModal;
