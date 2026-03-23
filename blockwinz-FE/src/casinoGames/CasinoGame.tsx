import { Box } from '@chakra-ui/react';
import { FunctionComponent } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Bets from './bets/Bets';
import GameInfo from './gameInfo/GameInfo';
import MoreGames from './moreGames/MoreGames';
import GameControllerIcon from '@/assets/icons/game-controller-icon.svg';
import MultiplayerIcon from '@/assets/icons/multiplayer-icon.svg';
import { originalGamesInfo } from '@/shared/constants/originalGamesInfo.constant';
import { multiplayerGamesInfo } from '@/shared/constants/multiplayerGamesInfo.constant';

interface GamesProps {}

const Games: FunctionComponent<GamesProps> = () => {
  const { pathname } = useLocation();
  const isMultiplayerRoute = pathname.includes('/multiplayer');

  return (
    <>
      <Outlet />
      <Box mt={'24px'}>
        <GameInfo />
      </Box>
      <Box mt={'42px'}>
        <MoreGames
          title={
            isMultiplayerRoute
              ? 'More multiplayer games'
              : 'More From Originals'
          }
          btnText='View All'
          btnLink={isMultiplayerRoute ? '/games?type=multiplayer' : '/originals'}
          icon={isMultiplayerRoute ? MultiplayerIcon : GameControllerIcon}
          allGames={
            isMultiplayerRoute
              ? Object.values(multiplayerGamesInfo)
              : Object.values(originalGamesInfo)
          }
        />
      </Box>
      <Box mt={'42px'}>
        <Bets />
      </Box>
    </>
  );
};

export default Games;
