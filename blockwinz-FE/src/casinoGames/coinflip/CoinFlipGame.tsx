import { GameControlsProvider } from './hooks/gameControlsContext';
import GameDashboard from '../dashboard/GameDashboard';
import BetPanel from './components/Controls';
import Game from './components/Game/Game';
import { GameTypeEnum } from '@blockwinz/shared';
import { originalGamesInfo } from '@/shared/constants/originalGamesInfo.constant';

export const CoinFlipGame = () => {
  return (
    <GameControlsProvider>
      <GameDashboard
        game={originalGamesInfo[GameTypeEnum.CoinFlipGame]}
        renderConfig={<BetPanel />}
        renderGame={<Game />}
      />
    </GameControlsProvider>
  );
};

export default CoinFlipGame;
