import { Box, Text } from '@chakra-ui/react';
import { FunctionComponent, useEffect, useMemo, useState } from 'react';
import NewReleasesIcon from 'assets/icons/new-releases-icon.svg';
import DropdownAlt from '@/components/Dropdown/DropdownAlt';
import Bets from '@/casinoGames/bets/Bets';
import { originalGamesInfo } from '@/shared/constants/originalGamesInfo.constant';
import GameCardList from '@/components/GameCardList/GameCardList';
import { GameInfo } from '@/shared/types/types';
import { GameCategoryEnum } from '@blockwinz/shared';
import NoGameCard from '@/components/NoGameCard/NoGameCard';
import usePageData from '@/hooks/usePageData';

interface NewReleasesProps {}

const NewReleases: FunctionComponent<NewReleasesProps> = () => {
  const { selectedSegment } = usePageData();
  const [selectedCategory, setSelectedCategory] = useState(selectedSegment);

  const categoryOptions = [
    { label: 'All Categories', value: 'all' },
    { label: 'Originals', value: GameCategoryEnum.ORIGINALS },
    { label: 'Multiplayer', value: GameCategoryEnum.MULTIPLAYER },
  ];

  useEffect(() => {
    setSelectedCategory(selectedSegment);
  }, [selectedSegment]);

  const newReleases: GameInfo[] = useMemo(
    () => [
      originalGamesInfo.MinesGame,
      originalGamesInfo.DiceGame,
      originalGamesInfo.LimboGame,
      originalGamesInfo.KenoGame,
      originalGamesInfo.WheelGame,
      originalGamesInfo.PlinkoGame,
    ],
    [],
  );

  const filteredGames = useMemo(() => {
    if (selectedCategory === 'all') return newReleases;
    return newReleases.filter(game => game.category === selectedCategory);
  }, [selectedCategory, newReleases]);

  const renderNewReleases = (): JSX.Element => {
    return filteredGames.length > 0 ? (
      <GameCardList games={filteredGames} />
    ) : (
      <NoGameCard />
    );
  };

  return (
    <Box>
      <Box
        borderRightRadius='8px'
        w='100%'
        display='flex'
        alignItems='center'
        bg='#151832'
        py='16px'
        px='16px'>
        <img
          src={NewReleasesIcon}
          alt='New Releases icon'
          style={{ width: '32px', height: '32px' }}
        />
        <Text fontSize='24px' fontWeight='500' lineHeight='36px' ml='12px'>
          New Releases
        </Text>
      </Box>

      <Box mt='16px' display='flex' flexDir='column' gap='16px'>
        <Box
          display='flex'
          justifyContent='space-between'
          alignItems='center'
          gap='16px'>
          <Box>
            <DropdownAlt
              placeholder='Select Category'
              options={categoryOptions}
              handleChange={e => setSelectedCategory(e as GameCategoryEnum)}
              selected={selectedCategory}
            />
          </Box>
          <Box>
            <Text fontSize='20px' fontWeight='600' lineHeight='24px'>
              {filteredGames.length}{' '}
              {filteredGames.length === 1 ? 'Game' : 'Games'}
            </Text>
          </Box>
        </Box>
      </Box>

      <Box>{renderNewReleases()}</Box>

      <Box mt='54px'>
        <Bets />
      </Box>
    </Box>
  );
};

export default NewReleases;
