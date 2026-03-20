import { FunctionComponent } from 'react';
import {
  DrawerBackdrop,
  DrawerBody,
  DrawerContent,
  DrawerRoot,
  DrawerTrigger,
} from '../ui/drawer';
import Chat from '@/pages/Chat/Chat';
import useChat from '@/hooks/useChat';
import { useIsMobile } from '@/hooks/useIsMobile';

interface ChatDrawerProps {
  chatButton: JSX.Element;
}

const ChatDrawer: FunctionComponent<ChatDrawerProps> = ({ chatButton }) => {
  const { chatIsOpen, setChatIsOpen } = useChat();
  const isMobile = useIsMobile();

  if (!isMobile) {
    return <></>;
  }

  return (
    <DrawerRoot
      size={{ base: 'full', md: 'full' }}
      open={chatIsOpen}
      onOpenChange={e => setChatIsOpen(e.open)}
      placement='end'>
      <DrawerTrigger asChild>{chatButton}</DrawerTrigger>

      <DrawerBackdrop />

      <DrawerContent>
        <DrawerBody p={'0'}>
          <Chat />
        </DrawerBody>
      </DrawerContent>
    </DrawerRoot>
  );
};

export default ChatDrawer;
