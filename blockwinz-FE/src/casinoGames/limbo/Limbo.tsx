import { FunctionComponent } from 'react';
import GameDashboard from '../dashboard/GameDashboard';
import Dashboard from './components/Dashboard';
import GameBoard from './components/GameBoard';
import { LimboGameProvider } from './context/LimboGameContext';
import { GameTypeEnum } from '@/shared/enums/gameType.enum';
import { originalGamesInfo } from '@/shared/constants/originalGamesInfo.constant';
interface LimboProps {}

const Limbo: FunctionComponent<LimboProps> = () => {
  return (
    <>
      <LimboGameProvider>
        <GameDashboard
          game={originalGamesInfo[GameTypeEnum.LimboGame]}
          renderConfig={<Dashboard />}
          renderGame={<GameBoard />}></GameDashboard>
      </LimboGameProvider>
    </>
  );
};

export default Limbo;
