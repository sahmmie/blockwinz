import { Box } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { gameOptions } from '../../constants';
import GameResultComponentLoader from '../GameResults/GameResultComponentLoader';
import DropdownAlt from '@/components/Dropdown/DropdownAlt';
import { GameTypeEnum } from '@blockwinz/shared';
import { GameInfo } from '@/shared/types/types';

interface VerifyTabProps {
  initialGameValue: GameInfo | null
}

const VerifyTab: React.FC<VerifyTabProps> = ({ initialGameValue }) => {
  const [game, setGame] = useState<GameTypeEnum | null>(() => {
    const id = initialGameValue?.id as GameTypeEnum | undefined;
    return id ?? null;
  });

  useEffect(() => {
    const id = initialGameValue?.id as GameTypeEnum | undefined;
    if (id != null) {
      setGame(id);
    }
  }, [initialGameValue?.id]);

  return (
    <Box display='flex' flexDirection='column' gap={'12px'} minH={'400px'}>
      <DropdownAlt
        options={gameOptions}
        placeholder='Select a game'
        handleChange={selectedOption => setGame(selectedOption as GameTypeEnum)}
        label='Game'
        selected={game ?? ''}
      />
      {game != null && <GameResultComponentLoader selectedGame={game} />}
    </Box>
  );
};

export default VerifyTab;
