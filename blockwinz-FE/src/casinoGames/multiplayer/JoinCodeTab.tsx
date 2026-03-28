import { Box, Text } from '@chakra-ui/react';
import { FunctionComponent, useState } from 'react';
import { Button } from '@/components/ui/button';
import MultiplayerTextField from './MultiplayerTextField';

interface JoinCodeTabProps {
  disabled: boolean;
  loading: boolean;
  /** Opens confirmation modal; join runs after the user confirms. */
  onRequestJoin: (sessionId: string, joinCode: string) => void;
}

/**
 * Join a private lobby with session id + plaintext join code.
 */
const JoinCodeTab: FunctionComponent<JoinCodeTabProps> = ({
  disabled,
  loading,
  onRequestJoin,
}) => {
  const [sessionId, setSessionId] = useState('');
  const [code, setCode] = useState('');

  const handleJoin = () => {
    const sid = sessionId.trim();
    const c = code.trim();
    if (sid && c) onRequestJoin(sid, c);
  };

  return (
    <Box>
      <Text fontSize='sm' color='gray.400' mb={3} lineHeight='tall'>
        Paste the lobby ID and code your host shared with you.
      </Text>
      <MultiplayerTextField
        label='Session ID'
        value={sessionId}
        placeholder='xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'
        monospace
        showPasteButton
        onChange={setSessionId}
      />
      <MultiplayerTextField
        label='Join code'
        value={code}
        placeholder='Code from host'
        showPasteButton
        onChange={setCode}
      />
      <Button
        w='100%'
        size='lg'
        h='52px'
        mt={1}
        bg='#00DD25'
        color='#151832'
        fontWeight='600'
        loading={loading}
        disabled={
          disabled || loading || !sessionId.trim() || !code.trim()
        }
        onClick={handleJoin}>
        Join game
      </Button>
    </Box>
  );
};

export default JoinCodeTab;
