import GameDashboard from '@/casinoGames/dashboard/GameDashboard';
import BetPanel from '../components/Controls';
import Game from '../components/Game/Game';
import { GameTypeEnum } from '@/shared/enums/gameType.enum';
import { GameControlsProvider } from '../hooks/gameControlsContext';
import { originalGamesInfo } from '@/shared/constants/originalGamesInfo.constant';

const PlinkoGame: React.FC = () => {
  return (
    <GameControlsProvider>
      <GameDashboard
        game={originalGamesInfo[GameTypeEnum.PlinkoGame]}
        renderConfig={<BetPanel />}
        renderGame={<Game />}></GameDashboard>
    </GameControlsProvider>
  );
};

export default PlinkoGame;
