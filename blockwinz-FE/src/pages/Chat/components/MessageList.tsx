import { Box, Text, Center } from '@chakra-ui/react';
import { FunctionComponent, useEffect, useRef, useState } from 'react';
import Message from './Message';
import { MessageI } from '../types/message';
import { Button } from '@/components/ui/button';
import { BsArrowDown } from 'react-icons/bs';

interface MessageListProps {
  messages: MessageI[];
  onLoadMore?: () => void;
  setScrollToBottomRef?: (fn: () => void) => void;
}

const MessageList: FunctionComponent<MessageListProps> = ({
  messages,
  onLoadMore,
  setScrollToBottomRef,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hasMountedOnce = useRef(false);
  const hasEmittedTop = useRef(false); // prevent spamming top emit
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(true);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [activateScrollToTop, setActivateScrollToTop] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const timer = setTimeout(() => {
      setActivateScrollToTop(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const isUserNearBottom = () => {
    const container = containerRef.current;
    if (!container) return false;
    const { scrollTop, scrollHeight, clientHeight } = container;
    return scrollHeight - scrollTop - clientHeight < 200;
  };

  const isUserNearTop = () => {
    const container = containerRef.current;
    if (!container || !activateScrollToTop) return false;
    return container.scrollTop < 200;
  };

  const handleScroll = () => {
    const nearTop = isUserNearTop();
    const nearBottom = isUserNearBottom();

    // Only trigger onLoadMore if we have messages and user is near top
    if (
      nearTop &&
      !hasEmittedTop.current &&
      onLoadMore &&
      messages.length > 0
    ) {
      onLoadMore();
      hasEmittedTop.current = true;
    }
    if (!nearTop && hasEmittedTop.current) {
      hasEmittedTop.current = false; // reset flag when user scrolls away from top
    }

    // Smart auto-scroll logic
    if (nearBottom) {
      setAutoScrollEnabled(true);
      setShowScrollToBottom(false);
    } else {
      setAutoScrollEnabled(false);
      setShowScrollToBottom(true);
    }
  };

  useEffect(() => {
    if (messages.length === 0) return;

    if (!hasMountedOnce.current) {
      scrollToBottom();
      hasMountedOnce.current = true;
      return;
    }

    if (autoScrollEnabled) {
      scrollToBottom();
    }
  }, [messages, autoScrollEnabled]);

  useEffect(() => {
    if (setScrollToBottomRef) setScrollToBottomRef(scrollToBottom);
  }, [setScrollToBottomRef]);

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const renderMessagesWithDividers = () => {
    return messages.map((message, index) => {
      const showDivider =
        index === 0 ||
        formatDate(message.timestamp) !==
          formatDate(messages[index - 1].timestamp);

      return (
        <Box key={message?._id || `message-${index}-${Date.now()}`}>
          {showDivider && (
            <Center my={4}>
              <Box flex='1' h='1px' bg='whiteAlpha.200' />
              <Text mx={4} color='whiteAlpha.600' fontSize='sm'>
                {formatDate(message.timestamp)}
              </Text>
              <Box flex='1' h='1px' bg='whiteAlpha.200' />
            </Center>
          )}
          <Message message={message} />
        </Box>
      );
    });
  };

  return (
    <Box
      ref={containerRef}
      onScroll={handleScroll}
      pt={4}
      px={3}
      maxH='100%'
      h={'100%'}
      overflowY='auto'
      css={{
        '&::-webkit-scrollbar': {
          width: '4px',
        },
        '&::-webkit-scrollbar-track': {
          width: '6px',
        },
        '&::-webkit-scrollbar-thumb': {
          background: '#54546399',
          borderRadius: '24px',
        },
      }}>
      {renderMessagesWithDividers()}
      <div ref={messagesEndRef} />
      {showScrollToBottom && (
        <Button
          aria-label='Scroll to bottom'
          position='fixed'
          bottom='120px'
          right='32px'
          zIndex={10}
          borderRadius='full'
          boxShadow='md'
          onClick={scrollToBottom}
          bg='#151832'
          _hover={{ bg: '#23265a' }}>
          <BsArrowDown color='white' width={24} height={24} />
        </Button>
      )}
    </Box>
  );
};

export default MessageList;
