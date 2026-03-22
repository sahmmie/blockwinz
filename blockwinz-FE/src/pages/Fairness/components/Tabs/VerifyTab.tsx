import { Box } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { gameOptions } from '../../constants';
import GameResultComponentLoader from '../GameResults/GameResultComponentLoader';
import DropdownAlt from '@/components/Dropdown/DropdownAlt';
import { GameTypeEnum } from '@blockwinz/shared';
import { GameInfo } from '@/shared/types/types';
import { patchFairnessUrlParams, PF_KEYS } from '../../fairnessUrlParams';

interface VerifyTabProps {
  initialGameValue: GameInfo | null
}

const VerifyTab: React.FC<VerifyTabProps> = ({ initialGameValue }) => {
  const [, setSearchParams] = useSearchParams();
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

  const handleGameChange = (selectedOption: string | GameTypeEnum) => {
    const g = selectedOption as GameTypeEnum;
    setGame(g);
    setSearchParams(
      prev =>
        patchFairnessUrlParams(prev, {
          [PF_KEYS.GAME]: g,
        }),
      { replace: true },
    );
  };

  return (
    <Box display='flex' flexDirection='column' gap={'12px'} minH={'400px'}>
      <DropdownAlt
        options={gameOptions}
        placeholder='Select a game'
        handleChange={handleGameChange}
        label='Game'
        selected={game ?? ''}
      />
      {game != null && <GameResultComponentLoader selectedGame={game} />}
    </Box>
  );
};

export default VerifyTab;
