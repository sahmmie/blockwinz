import { Box, Text } from '@chakra-ui/react';
import { FunctionComponent, useCallback, useEffect, useState } from 'react';
import GamesIcon from 'assets/bw-icon-only.svg';
import DropdownAlt from '@/components/Dropdown/DropdownAlt';
import { originalGamesInfo } from '@/shared/constants/originalGamesInfo.constant';
import { GameInfo } from '@/shared/types/types';
import GameCardList from '@/components/GameCardList/GameCardList';
import { GameCategoryEnum } from '@blockwinz/shared';
import NoGameCard from '@/components/NoGameCard/NoGameCard';
import usePageData from '@/hooks/usePageData';

interface GamesProps {}

const Games: FunctionComponent<GamesProps> = () => {
  const { selectedSegment } = usePageData();
  const [selectedCategory, setSelectedCategory] = useState(selectedSegment);
  const [selectedSort, setSelectedSort] = useState('');

  const categoryOptions = [
    { label: 'All Categories', value: 'all' },
    { label: 'Originals', value: GameCategoryEnum.ORIGINALS },
    { label: 'Multiplayer', value: GameCategoryEnum.MULTIPLAYER },
  ];

  const sortOptions = [
    { label: 'Latest', value: 'latest' },
    { label: 'Oldest', value: 'oldest' },
  ];

  const casinoGames: GameInfo[] = Object.values(originalGamesInfo);

  useEffect(() => {
    setSelectedCategory(selectedSegment);
  }, [selectedSegment]);

  const filterByCategory = useCallback(
    (category: string): GameInfo[] => {
      if (category === 'all') return casinoGames;
      return casinoGames.filter(game => game.category === category);
    },
    [casinoGames],
  );

  const sortBy = useCallback(
    (sortBy: string, games: GameInfo[]): GameInfo[] => {
      const withDate = games.filter(game => game.releasedAt);
      const withoutDate = games.filter(game => !game.releasedAt);

      if (sortBy === 'latest') {
        withDate.sort(
          (a, b) =>
            (b.releasedAt?.getTime() ?? 0) - (a.releasedAt?.getTime() ?? 0),
        );
      } else if (sortBy === 'oldest') {
        withDate.sort(
          (a, b) =>
            (a.releasedAt?.getTime() ?? 0) - (b.releasedAt?.getTime() ?? 0),
        );
      }

      return [...withDate, ...withoutDate];
    },
    [],
  );

  const renderGames = (): JSX.Element => {
    const filteredGames = filterByCategory(selectedCategory);
    const sortedGames = sortBy(selectedSort, filteredGames);

    return sortedGames.length > 0 ? (
      <GameCardList games={sortedGames} />
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
          src={GamesIcon}
          alt='Games icon'
          style={{ width: '32px', height: '32px' }}
        />
        <Text fontSize='24px' fontWeight='500' lineHeight='36px' ml='12px'>
          Games
        </Text>
      </Box>

      <Box mt='16px' display='flex' flexDir='column' gap='16px'>
        <Box
          display='flex'
          justifyContent='space-between'
          alignItems='center'
          gap='16px'>
          <Box w='200px'>
            <DropdownAlt
              placeholder='Select Category'
              options={categoryOptions}
              handleChange={e => setSelectedCategory(e as GameCategoryEnum)}
              selected={selectedCategory}
            />
          </Box>
          <Box w='200px'>
            <DropdownAlt
              placeholder='Sort By'
              options={sortOptions}
              handleChange={e => setSelectedSort(e)}
              selected={selectedSort}
            />
          </Box>
        </Box>
      </Box>

      <Box>{renderGames()}</Box>
    </Box>
  );
};

export default Games;
