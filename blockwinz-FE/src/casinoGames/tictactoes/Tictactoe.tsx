import { FunctionComponent } from 'react';
import { TictactoeGameProvider } from './context/TictactoeGameContext';
import GameDashboard from '../dashboard/GameDashboard';
import Dashboard from './components/Dashboard';
import GameBoard from './components/GameBoard';
import { MultiplayerGameTypeEnum } from '@blockwinz/shared';
import { multiplayerGamesInfo } from '@/shared/constants/multiplayerGamesInfo.constant';

interface TictactoeProps {}

const Tictactoe: FunctionComponent<TictactoeProps> = () => {
  return (
    <>
      <TictactoeGameProvider>
        <GameDashboard
          game={multiplayerGamesInfo[MultiplayerGameTypeEnum.TicTacToeGame]}
          renderConfig={<Dashboard />}
          renderGame={<GameBoard />}></GameDashboard>
      </TictactoeGameProvider>
    </>
  );
};

export default Tictactoe;
