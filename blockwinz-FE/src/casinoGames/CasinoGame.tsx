import { Box } from '@chakra-ui/react';
import { FunctionComponent } from 'react';
import { Outlet } from 'react-router-dom';
import Bets from './bets/Bets';
import GameInfo from './gameInfo/GameInfo';
import MoreGames from './moreGames/MoreGames';
import GameControllerIcon from '@/assets/icons/game-controller-icon.svg';
import { originalGamesInfo } from '@/shared/constants/originalGamesInfo.constant';

interface GamesProps {}

const Games: FunctionComponent<GamesProps> = () => {
  return (
    <>
      <Outlet />
      <Box mt={'24px'}>
        <GameInfo />
      </Box>
      <Box mt={'42px'}>
        <MoreGames
          title='More From Originals'
          btnText='View All'
          btnLink='/originals'
          icon={GameControllerIcon}
          allGames={Object.values(originalGamesInfo)}
        />
      </Box>
      <Box mt={'42px'}>
        <Bets />
      </Box>
    </>
  );
};

export default Games;
