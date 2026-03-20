import { FunctionComponent } from 'react';
import GameDashboard from '../dashboard/GameDashboard';
import { GameTypeEnum } from '@/shared/enums/gameType.enum';
import { KenoGameProvider } from './context/KenoGameContext';
import Dashboard from './components/Dashboard';
import GameBoard from './components/GameBoard/GameBoard';
import { originalGamesInfo } from '@/shared/constants/originalGamesInfo.constant';

interface KenoProps {}

const Keno: FunctionComponent<KenoProps> = () => {
  return (
    <>
      <KenoGameProvider>
        <GameDashboard
          game={originalGamesInfo[GameTypeEnum.KenoGame]}
          renderConfig={<Dashboard />}
          renderGame={<GameBoard />}></GameDashboard>
      </KenoGameProvider>
    </>
  );
};

export default Keno;
