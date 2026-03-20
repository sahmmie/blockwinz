import { Box, Text, Spinner } from '@chakra-ui/react';
import { FunctionComponent, useEffect, useMemo, useState } from 'react';
import FavouritesIcon from 'assets/icons/favourite-icon.svg';
import DropdownAlt from '@/components/Dropdown/DropdownAlt';
import EmptyFolderIcon from 'assets/icons/empty-folder-icon.svg';
import Bets from '@/casinoGames/bets/Bets';
import GameCardList from '@/components/GameCardList/GameCardList';
import { GameCategoryEnum } from '@blockwinz/shared';
import { useFavouritesStore } from '@/hooks/useFavourite';
import usePageData from '@/hooks/usePageData';

interface FavouritesProps {}

const Favourites: FunctionComponent<FavouritesProps> = () => {
  const { selectedSegment } = usePageData();
  const [selectedCategory, setSelectedCategory] = useState(selectedSegment);
  const [selectedSort, setSelectedSort] = useState('latest');
  const { favourites, isLoading } = useFavouritesStore();

  useEffect(() => {
    setSelectedCategory(selectedSegment);
  }, [selectedSegment]);

  const categoryOptions = [
    { label: 'All Categories', value: 'all' },
    { label: 'Originals', value: GameCategoryEnum.ORIGINALS },
    { label: 'Multiplayer', value: GameCategoryEnum.MULTIPLAYER },
  ];

  const sortOptions = [
    { label: 'Latest', value: 'latest' },
    { label: 'Oldest', value: 'oldest' },
  ];

  const filteredAndSortedGames = useMemo(() => {
    if (isLoading) return [];

    let games = [...favourites];

    if (selectedCategory !== 'all') {
      games = games.filter(game => game.category === selectedCategory);
    }

    games.sort((a, b) => {
      const dateA = new Date(a.releasedAt ?? 0).getTime();
      const dateB = new Date(b.releasedAt ?? 0).getTime();
      return selectedSort === 'latest' ? dateB - dateA : dateA - dateB;
    });

    return games;
  }, [selectedCategory, selectedSort, favourites, isLoading]);

  const renderFavourites = (): JSX.Element => {
    return <GameCardList games={filteredAndSortedGames} />;
  };

  const renderNoData = (): JSX.Element => {
    return (
      <Box
        borderRadius='0 0 16px 16px'
        mt='16px'
        h='488px'
        display='flex'
        flexDir='column'
        justifyContent='center'
        alignItems='center'
        bg='#151832'
        w='100%'>
        <img
          src={EmptyFolderIcon}
          alt='No Data Icon'
          style={{ width: '326px' }}
        />
        <Text fontWeight={600} fontSize='32px' lineHeight='48px' mt='24px'>
          No Favourites yet
        </Text>
      </Box>
    );
  };

  const renderLoading = (): JSX.Element => (
    <Box
      h='488px'
      display='flex'
      justifyContent='center'
      alignItems='center'
      bg='#151832'>
      <Spinner size='xl' color='white' />
    </Box>
  );

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
          src={FavouritesIcon}
          alt='Favourites icon'
          style={{ width: '32px', height: '32px' }}
        />
        <Text fontSize='24px' fontWeight='500' ml='12px'>
          Favourites
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

      <Box>
        {isLoading
          ? renderLoading()
          : filteredAndSortedGames.length > 0
          ? renderFavourites()
          : renderNoData()}
      </Box>

      <Box mt='54px'>
        <Bets />
      </Box>
    </Box>
  );
};

export default Favourites;
