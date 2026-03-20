import { Box, Text, Center, Flex } from '@chakra-ui/react';
import {
  FunctionComponent,
  useEffect,
  useState,
  useRef,
  useCallback,
} from 'react';
import useChat from '@/hooks/useChat';
import MessageList from './components/MessageList';
import ChatInput from './components/ChatInput';
import { MdClose } from 'react-icons/md';
import { Button } from '@/components/ui/button';
import { RoomInfo } from './types/room';
import { MessageI } from './types/message';
import { useSocketContext } from '@/context/socketContext';

interface ChatProps {}

const Chat: FunctionComponent<ChatProps> = () => {
  const { on, off, emit, isConnected } = useSocketContext();
  const {
    conversations,
    activeConversation,
    setActiveConversation,
    setChatIsOpen,
    setRooms,
    setMessages,
    updateRoom,
    addMessage,
  } = useChat();

  const [page, setPage] = useState(1);
  const limit = 50;
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [messageError, setMessageError] = useState<Error | null>(null);
  const messagesBoxRef = useRef<HTMLDivElement>(null);

  const activeMessages =
    conversations.find(c => c.room.name === activeConversation)?.messages || [];

  const handleClose = () => {
    setChatIsOpen(false);
  };

  // Memoized getUserRooms
  const getUserRooms = useCallback(() => {
    if (!isConnected()) return;
    emit('getUserRooms', {}, (response: RoomInfo[]) => {
      setRooms(response);
      if (response.length > 0 && !activeConversation) {
        setActiveConversation(response[0].name);
      }
      setHasInitialized(true);
    });
  }, [emit, isConnected, setRooms, setActiveConversation, activeConversation]);

  // Memoized getRoomPreviousMessages
  const getRoomPreviousMessages = useCallback(
    (pageNum: number = 1, isLoadMore: boolean = false) => {
      if (!isConnected() || !activeConversation || !hasMoreMessages) return;
      if (isLoadMore) {
        setIsLoadingMore(true);
      } else {
        setIsInitialLoading(true);
      }
      emit(
        'getRoomPreviousMessages',
        {
          room: activeConversation,
          query: {
            page: pageNum,
            limit: limit,
          },
        },
        (response: MessageI[]) => {
          if (response && response.length > 0) {
            setMessages(activeConversation as string, response);
            if (response.length < limit) {
              setHasMoreMessages(false); // No more messages to load
            }
          } else {
            setHasMoreMessages(false); // No more messages to load
          }
          setIsLoadingMore(false);
          setIsInitialLoading(false);
        },
      );
    },
    [
      emit,
      isConnected,
      activeConversation,
      limit,
      setMessages,
      hasMoreMessages,
    ],
  );

  // Stable event handlers
  const handleNewMessage = useCallback(
    (message: MessageI) => {
      addMessage(message.roomName, message);
    },
    [addMessage],
  );

  const handleRoomInfo = useCallback(
    (data: RoomInfo) => {
      updateRoom(data);
    },
    [updateRoom],
  );

  // Register and clean up socket listeners
  useEffect(() => {
    on('newMessage', handleNewMessage);
    on('roomInfo', handleRoomInfo);
    on('messageError', (error: Error) => setMessageError(error));
    return () => {
      off('newMessage', handleNewMessage);
      off('roomInfo', handleRoomInfo);
    };
  }, [on, off, handleNewMessage, handleRoomInfo]);

  // Handle initial data loading when socket connects - ONLY ONCE
  useEffect(() => {
    if (!isConnected() || hasInitialized) return;
    getUserRooms();
  }, [isConnected, hasInitialized, getUserRooms]);

  // Load messages when activeConversation changes or when we have an active conversation but no messages
  useEffect(() => {
    if (!isConnected() || !activeConversation || hasInitialized) return;
    setHasMoreMessages(true); // Reset on room change
    setPage(1); // Reset page on room change
    if (activeMessages.length === 0) {
      getRoomPreviousMessages(1, false);
    }
  }, [isConnected, activeConversation, hasInitialized, activeMessages]);

  const canLoadMore = !isInitialLoading && !isLoadingMore && hasMoreMessages;

  const handleLoadMore = () => {
    if (!canLoadMore || !hasInitialized) return;
    const nextPage = page + 1;
    setPage(nextPage);
    getRoomPreviousMessages(nextPage, true);
  };

  // Retry loading messages if they haven't loaded after connection is established
  const retryLoadMessages = () => {
    if (activeConversation) {
      setPage(1);
      getRoomPreviousMessages(1, false);
    }
  };

  return (
    <Box
      w='100%'
      h='100%'
      bg='#151832'
      borderTopLeftRadius={8}
      display='flex'
      flexDirection='column'>
      {/* Chat Header - Fixed */}
      <Box
        borderTopLeftRadius={8}
        p={4}
        borderBottom='1px solid'
        borderColor='whiteAlpha.200'
        bg='#1A1D3A'
        position='sticky'
        top={0}
        zIndex={1}>
        <Flex justifyContent='space-between' alignItems='center'>
          <Text fontSize='lg' fontWeight='bold' color='white'>
            General Chat
          </Text>
          <Button
            unstyled
            _hover={{ bg: 'whiteAlpha.100' }}
            color='whiteAlpha.800'
            onClick={handleClose}>
            <MdClose size={24} />
          </Button>
        </Flex>
      </Box>

      {/* Messages Area - Scrollable */}
      <Box
        ref={messagesBoxRef}
        pt={'20px'}
        flex='1'
        position='relative'
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
        {isInitialLoading && (
          <Center py={4}>
            <Text color='whiteAlpha.600'>Loading messages...</Text>
          </Center>
        )}
        {isLoadingMore && activeMessages.length > 0 && (
          <Center py={4}>
            <Text color='whiteAlpha.600'>Loading more messages...</Text>
          </Center>
        )}
        {!isInitialLoading && activeMessages.length === 0 ? (
          <Center h='100%' color='whiteAlpha.600' flexDirection='column'>
            <Text mb={2}>No messages yet. Start a conversation!</Text>
            {isConnected() && isInitialLoading && (
              <Button
                size='sm'
                onClick={retryLoadMessages}
                bg='whiteAlpha.200'
                _hover={{ bg: 'whiteAlpha.300' }}
                color='white'>
                Retry Loading Messages
              </Button>
            )}
          </Center>
        ) : (
          !isInitialLoading && (
            <MessageList
              messages={activeMessages}
              onLoadMore={handleLoadMore}
            />
          )
        )}
      </Box>

      {/* Chat Input - Fixed */}
      <Box position='sticky' bottom={0} bg='#151832' zIndex={1}>
        <ChatInput emit={emit} messageError={messageError} />
      </Box>
    </Box>
  );
};

export default Chat;
