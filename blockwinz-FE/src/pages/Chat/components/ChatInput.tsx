import CustomInput from '@/components/CustomInput/CustomInput';
import { Button } from '@/components/ui/button';
import useChat from '@/hooks/useChat';
import { Box, Flex, Text } from '@chakra-ui/react';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import {
  FunctionComponent,
  KeyboardEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { MdEmojiEmotions } from 'react-icons/md';
import { MessageI } from '../types/message';
import { toaster } from '@/components/ui/toaster';

const MAX_CHARS = 200;

interface ChatInputProps {
  messageError: Error | null;
  emit: (
    event: string,
    data: Pick<MessageI, 'roomName' | 'content'>,
    callback?: (response: MessageI) => void,
  ) => void;
}

const ChatInput: FunctionComponent<ChatInputProps> = ({
  emit,
  messageError,
}) => {
  const [message, setMessage] = useState('');
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const { setIsLoading, activeConversation, isLoading, conversations } =
    useChat();

  const isSendingRef = useRef(false);

  const roomInfo = conversations.find(
    c => c.room.name === activeConversation,
  )?.room;

  const charCount = message.length;
  const isOverLimit = charCount > MAX_CHARS;

  const handleMessageError = useCallback(
    (error: Error) => {
      toaster.create({
        description: error.message,
        type: 'error',
      });
      setIsLoading(false);
      isSendingRef.current = false;
    },
    [setIsLoading],
  );

  useEffect(() => {
    if (messageError) {
      handleMessageError(messageError);
    }
  }, [messageError, handleMessageError]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target as Node)
      ) {
        setIsEmojiPickerOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSend = async () => {
    if (
      !message.trim() ||
      isOverLimit ||
      !activeConversation ||
      isLoading ||
      isSendingRef.current
    )
      return;
    isSendingRef.current = true;
    setIsLoading(true);
    emit(
      'sendMessage',
      {
        roomName: activeConversation,
        content: message,
      },
      () => {
        setMessage('');
        setIsLoading(false);
        isSendingRef.current = false;
      },
    );
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !isLoading) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMessage = e.target.value;
    if (newMessage.length <= MAX_CHARS) {
      setMessage(newMessage);
    }
  };

  const onEmojiClick = (emojiData: EmojiClickData) => {
    const newMessage = message + emojiData.emoji;
    if (newMessage.length <= MAX_CHARS) {
      setMessage(newMessage);
    }
    setIsEmojiPickerOpen(false);
  };

  const endElement = () => (
    <Box position='relative'>
      <Button
        variant='ghost'
        color='whiteAlpha.800'
        _hover={{ bg: 'whiteAlpha.100' }}
        h='32px'
        w='32px'
        p={0}
        onClick={() => setIsEmojiPickerOpen(!isEmojiPickerOpen)}>
        <MdEmojiEmotions size={24} />
      </Button>
      {isEmojiPickerOpen && (
        <Box
          ref={emojiPickerRef}
          position='fixed'
          bottom='120px'
          right='20px'
          zIndex={9999}
          boxShadow='lg'
          borderRadius='lg'
          overflow='hidden'>
          <EmojiPicker
            lazyLoadEmojis
            width={'100%'}
            height={'420px'}
            onEmojiClick={onEmojiClick}
            searchDisabled
            allowExpandReactions={false}
          />
        </Box>
      )}
    </Box>
  );

  return (
    <Box>
      <Box
        p={4}
        borderTop='1px solid'
        borderColor='whiteAlpha.200'
        display='flex'
        gap={2}>
        <Box flex='1'>
          <CustomInput
            type='text'
            autoComplete='off'
            fontSize={'sm'}
            value={message}
            onChange={handleChange}
            onKeyUp={handleKeyPress}
            placeholder='Type your message...'
            inputGroupProps={{
              borderRadius: '8px',
              bg: '#2A2D4A',
              w: '100%',
              h: '48px',
              fontSize: 'lg',
              endElement: endElement(),
            }}
          />
          <Flex justifyContent='space-between' alignItems='center' mt={1}>
            <Flex alignItems='center' gap={2}>
              <Box
                w='2'
                h='2'
                borderRadius='full'
                bg='#00DD25'
                boxShadow='0 0 8px #00DD25'
              />
              <Text fontSize='xs' color='whiteAlpha.800'>
                {roomInfo?.onlineMembersCount || 0} online
              </Text>
            </Flex>
            <Text
              fontSize='xs'
              color={isOverLimit ? 'red.500' : 'whiteAlpha.600'}>
              {charCount}/{MAX_CHARS} characters
            </Text>
          </Flex>
        </Box>
        <Button
          loading={isLoading}
          onClick={handleSend}
          bg='#00DD25'
          color='#151832'
          disabled={isOverLimit || !activeConversation || isLoading}
          h='48px'
          px={6}
          _hover={{
            bg: '#00DD25',
            opacity: isOverLimit ? 1 : 0.8,
          }}
          _active={{
            bg: '#00DD25',
            opacity: isOverLimit ? 1 : 0.9,
          }}>
          Send
        </Button>
      </Box>
    </Box>
  );
};

export default ChatInput;
