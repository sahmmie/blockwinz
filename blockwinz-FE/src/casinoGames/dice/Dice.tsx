import { FunctionComponent } from 'react';
import GameDashboard from '../dashboard/GameDashboard';
import Dashboard from './components/Dashboard';
import GameBoard from './components/GameBoard';
import { DiceGameProvider } from './context/DiceGameContext';
import { GameTypeEnum } from '@blockwinz/shared';
import { originalGamesInfo } from '@/shared/constants/originalGamesInfo.constant';

interface DiceProps {}

const Dice: FunctionComponent<DiceProps> = () => {
  return (
    <>
      <DiceGameProvider>
        <GameDashboard
          game={originalGamesInfo[GameTypeEnum.DiceGame]}
          renderConfig={<Dashboard />}
          renderGame={<GameBoard />}></GameDashboard>
      </DiceGameProvider>
    </>
  );
};

export default Dice;
