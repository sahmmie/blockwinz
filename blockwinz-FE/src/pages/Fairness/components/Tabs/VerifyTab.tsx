/* eslint-disable @typescript-eslint/no-explicit-any */
import { Box } from '@chakra-ui/react';
import React, { useState } from 'react';
import { gameOptions } from '../../constants';
import GameResultComponentLoader from '../GameResults/GameResultComponentLoader';
import DropdownAlt from '@/components/Dropdown/DropdownAlt';
import { GameTypeEnum } from '@/shared/enums/gameType.enum';
import { GameInfo } from '@/shared/types/types';

interface VerifyTabProps {
  initialGameValue: GameInfo | null
}

const VerifyTab: React.FC<VerifyTabProps> = ({ initialGameValue }) => {
  const [game, setGame] = useState<GameTypeEnum>(initialGameValue?.id as GameTypeEnum);

  return (
    <Box display='flex' flexDirection='column' gap={'12px'} minH={'400px'}>
      <DropdownAlt
        options={gameOptions}
        placeholder='Select a game'
        handleChange={selectedOption => setGame(selectedOption as GameTypeEnum)}
        label='Game'
        selected={game}
      />
      <GameResultComponentLoader selectedGame={game} />
    </Box>
  );
};

export default VerifyTab;
