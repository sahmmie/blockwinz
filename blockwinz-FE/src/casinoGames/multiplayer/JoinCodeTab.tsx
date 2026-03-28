import { Box, HStack, Spinner, Text } from '@chakra-ui/react';
import { FunctionComponent, useEffect, useState } from 'react';
import { LobbyVisibility } from '@blockwinz/shared';
import { Button } from '@/components/ui/button';
import MultiplayerTextField from './MultiplayerTextField';
import type { MultiplayerSessionRow } from './types';

interface JoinCodeTabProps {
  disabled: boolean;
  loading: boolean;
  /** Opens confirmation modal; join runs after the user confirms. */
  onRequestJoin: (
    sessionId: string,
    joinCode: string,
    hideJoinCodeInConfirm: boolean,
  ) => void;
  resolveLobbyFromPublicList: (
    sessionId: string,
  ) => Promise<MultiplayerSessionRow | null>;
}

/**
 * Join by pasted session ID. Join code field appears only when the lobby is private
 * (resolved via public list). Public / unknown listings join without a code.
 */
const JoinCodeTab: FunctionComponent<JoinCodeTabProps> = ({
  disabled,
  loading,
  onRequestJoin,
  resolveLobbyFromPublicList,
}) => {
  const [sessionId, setSessionId] = useState('');
  const [code, setCode] = useState('');
  const [resolvedRow, setResolvedRow] = useState<MultiplayerSessionRow | null>(
    null,
  );
  const [lookupIdle, setLookupIdle] = useState(true);

  useEffect(() => {
    const sid = sessionId.trim();
    if (!sid) {
      setResolvedRow(null);
      setLookupIdle(true);
      setCode('');
      return;
    }

    let cancelled = false;
    setLookupIdle(false);
    setResolvedRow(null);

    const t = window.setTimeout(() => {
      void (async () => {
        try {
          const row = await resolveLobbyFromPublicList(sid);
          if (!cancelled) {
            setResolvedRow(row ?? null);
            if (row?.visibility !== LobbyVisibility.PRIVATE) {
              setCode('');
            }
          }
        } finally {
          if (!cancelled) {
            setLookupIdle(true);
          }
        }
      })();
    }, 400);

    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [sessionId, resolveLobbyFromPublicList]);

  const needsJoinCode =
    resolvedRow?.visibility === LobbyVisibility.PRIVATE;
  const lookupBusy = !lookupIdle;
  const sidOk = Boolean(sessionId.trim());

  const handleJoin = () => {
    const sid = sessionId.trim();
    if (!sid || lookupBusy) return;
    if (needsJoinCode && !code.trim()) return;
    onRequestJoin(sid, needsJoinCode ? code.trim() : '', !needsJoinCode);
  };

  return (
    <Box>
      <MultiplayerTextField
        label='Session ID'
        value={sessionId}
        placeholder='xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'
        monospace
        showPasteButton
        onChange={(v) => {
          setSessionId(v);
        }}
      />
      {sidOk ? (
        <HStack gap={2} mt={2} mb={needsJoinCode ? 2 : 0}>
          {lookupBusy ? (
            <>
              <Spinner size='sm' color='#00DD25' />
              <Text fontSize='xs' color='gray.500'>
                Looking up table…
              </Text>
            </>
          ) : (
            <Text fontSize='xs' color='gray.500'>
              {needsJoinCode
                ? 'Private table — enter the join code from your host.'
                : resolvedRow
                  ? 'Public table — no join code needed.'
                  : "Couldn't load from browse list — you can still try to join without a code (use a link with ?code= for private tables)."}
            </Text>
          )}
        </HStack>
      ) : null}
      {needsJoinCode ? (
        <MultiplayerTextField
          label='Join code'
          value={code}
          placeholder='Code from host'
          showPasteButton
          onChange={setCode}
        />
      ) : null}
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
          disabled ||
          loading ||
          !sidOk ||
          lookupBusy ||
          (needsJoinCode && !code.trim())
        }
        onClick={handleJoin}>
        Join game
      </Button>
    </Box>
  );
};

export default JoinCodeTab;
