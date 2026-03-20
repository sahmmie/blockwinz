import { FunctionComponent } from 'react';
import Dashboard from './components/Dasboard';
import GameDashboard from '../dashboard/GameDashboard';
import { GameControlsProvider } from './context/GameControlsProvider';
import { GameTypeEnum } from '@blockwinz/shared';
import { MinesGameBoard } from './components/board';
import { originalGamesInfo } from '@/shared/constants/originalGamesInfo.constant';

interface MinesProps {}

const Mines: FunctionComponent<MinesProps> = () => {
  return (
    <>
      <GameControlsProvider>
        <GameDashboard
          game={originalGamesInfo[GameTypeEnum.MinesGame]}
          renderConfig={<Dashboard />}
          renderGame={<MinesGameBoard />}></GameDashboard>
      </GameControlsProvider>
    </>
  );
};

export default Mines;
