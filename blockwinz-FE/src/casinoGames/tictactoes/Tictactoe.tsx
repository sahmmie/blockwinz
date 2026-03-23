import { FunctionComponent } from 'react';
import { TictactoeGameProvider } from './context/TictactoeGameContext';
import GameDashboard from '../dashboard/GameDashboard';
import Dashboard from './components/Dashboard';
import GameBoard from './components/GameBoard';
import { MultiplayerGameTypeEnum } from '@blockwinz/shared';
import { multiplayerGamesInfo } from '@/shared/constants/multiplayerGamesInfo.constant';
import { SocketProvider } from '@/context/socketContext';

interface TictactoeProps {}

const Tictactoe: FunctionComponent<TictactoeProps> = () => {
  return (
    <SocketProvider namespace='game'>
      <TictactoeGameProvider>
        <GameDashboard
          game={multiplayerGamesInfo[MultiplayerGameTypeEnum.TicTacToeGame]!}
          renderConfig={<Dashboard />}
          renderGame={<GameBoard />}
          showProvablyFair={false}
        />
      </TictactoeGameProvider>
    </SocketProvider>
  );
};

export default Tictactoe;
