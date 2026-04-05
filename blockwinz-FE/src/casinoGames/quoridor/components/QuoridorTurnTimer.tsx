import { Box, Text } from '@chakra-ui/react';
import { FunctionComponent, useEffect, useState } from 'react';
import { MpPhase } from '@/casinoGames/tictactoes/types';

type QuoridorTurnTimerProps = {
  turnDeadlineAt: string | null | undefined;
  mpPhase: MpPhase;
  /** Online match in progress (hide for hotseat / lobby). */
  show: boolean;
};

/**
 * Server-authoritative turn countdown from `game_sessions.turn_deadline_at`.
 */
const QuoridorTurnTimer: FunctionComponent<QuoridorTurnTimerProps> = ({
  turnDeadlineAt,
  mpPhase,
  show,
}) => {
  const [displaySec, setDisplaySec] = useState<number | null>(null);

  useEffect(() => {
    if (!show || mpPhase !== MpPhase.Playing || !turnDeadlineAt) {
      setDisplaySec(null);
      return;
    }
    const end = new Date(turnDeadlineAt).getTime();
    if (Number.isNaN(end)) {
      setDisplaySec(null);
      return;
    }
    const tick = () => {
      const ms = end - Date.now();
      setDisplaySec(ms <= 0 ? 0 : Math.ceil(ms / 1000));
    };
    tick();
    const id = window.setInterval(tick, 250);
    return () => window.clearInterval(id);
  }, [turnDeadlineAt, mpPhase, show]);

  if (displaySec === null) {
    return null;
  }

  const warn = displaySec > 0 && displaySec <= 5;

  return (
    <Box
      px={3}
      py={1.5}
      borderRadius='md'
      bg={warn ? 'red.950' : 'blackAlpha.500'}
      borderWidth='1px'
      borderColor={warn ? 'red.500' : 'whiteAlpha.400'}>
      <Text
        fontSize='sm'
        fontWeight='semibold'
        color={warn ? 'red.100' : 'gray.100'}
        textAlign='center'>
        Turn clock: {displaySec <= 0 ? '0s' : `${displaySec}s`}
      </Text>
    </Box>
  );
};

export default QuoridorTurnTimer;
