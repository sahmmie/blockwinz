import { FunctionComponent } from 'react';
import { QuoridorGameProvider } from './context/QuoridorGameContext';
import GameDashboard from '../dashboard/GameDashboard';
import Dashboard from './components/Dashboard';
import QuoridorBoard from './components/QuoridorBoard';
import { MultiplayerGameTypeEnum } from '@blockwinz/shared';
import { multiplayerGamesInfo } from '@/shared/constants/multiplayerGamesInfo.constant';
import { SocketProvider } from '@/context/socketContext';

const Quoridor: FunctionComponent = () => {
  return (
    <SocketProvider namespace='game'>
      <QuoridorGameProvider>
        <GameDashboard
          game={multiplayerGamesInfo[MultiplayerGameTypeEnum.QuoridorGame]!}
          renderConfig={<Dashboard />}
          renderGame={<QuoridorBoard />}
          showProvablyFair={false}
          centerPlayArea
        />
      </QuoridorGameProvider>
    </SocketProvider>
  );
};

export default Quoridor;
