import { GameTypeEnum } from '@blockwinz/shared';
import GameDashboard from '../dashboard/GameDashboard';
import { GameControlsProvider } from './hooks/gameControlsContext';
import BetPanel from './components/Controls';
import Game from './components/Game/Game';
import { originalGamesInfo } from '@/shared/constants/originalGamesInfo.constant';

export const WheelGame = () => {
  return (
    <GameControlsProvider>
      <GameDashboard
        game={originalGamesInfo[GameTypeEnum.WheelGame]}
        renderConfig={<BetPanel />}
        renderGame={<Game />}
      />
    </GameControlsProvider>
  );
};

export default WheelGame;
