import { Box, Text } from '@chakra-ui/react';
import { FunctionComponent } from 'react';
import { format } from 'date-fns';
import { Avatar } from '@/components/ui/avatar';
import useAccount from '@/hooks/userAccount';
import { MessageI } from '../types/message';

interface MessageProps {
  message: MessageI;
}

const Message: FunctionComponent<MessageProps> = ({ message }) => {
  const { userData } = useAccount();
  const isUser = message.userId === userData?._id;

  return (
    <Box
      display='flex'
      justifyContent={isUser ? 'flex-end' : 'flex-start'}
      mb={3}
      px={4}
      gap={2}>
      {!isUser && <Avatar name={message.username} size='sm' bg='#2A2D4A' />}
      <Box maxW='80%' display='flex' flexDirection='column'>
        {!isUser && (
          <Text fontSize='xs' color='rgba(255, 255, 255, 0.7)' mb={1}>
            {message.username || 'Anonymous'}
          </Text>
        )}
        <Box
          bg={isUser ? '#00DD25' : '#2A2D4A'}
          color={isUser ? '#151832' : 'white'}
          p={3}
          borderRadius='lg'
          position='relative'
          display='flex'
          alignItems='flex-start'
          gap={2}>
          <Text fontSize='sm' flex='1' whiteSpace='pre-wrap' wordBreak='break-word'>
            {message.content}
          </Text>
        </Box>
        <Text
          fontSize='xs'
          color={isUser ? '#00DD25' : 'rgba(255, 255, 255, 0.7)'}
          mt={1}
          alignSelf={isUser ? 'flex-end' : 'flex-start'}>
          {format(message.timestamp, 'HH:mm')}
        </Text>
      </Box>
      {isUser && <Avatar name={message.username} size='sm' bg='#00DD25' color={'#151832'} />}
    </Box>
  );
};

export default Message;
