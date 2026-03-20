import { Box, HStack, Image, Text, useBreakpointValue } from '@chakra-ui/react';
import { FunctionComponent, useEffect, useState } from 'react';
import GameControllerIcon from '@/assets/icons/game-controller-icon.svg';
import { Button } from '@/components/ui/button';
import {
  PaginationNextTrigger,
  PaginationPrevTrigger,
  PaginationRoot,
} from '@/components/ui/pagination';
import { GameInfo } from '@/shared/types/types';
import GameCarousel from '@/components/GameCarousel/GameCarousel';
import { useNavigate } from 'react-router-dom';

interface MoreGamesProps {
  title: string;
  btnText?: string;
  btnLink: string;
  icon: string;
  allGames: GameInfo[];
}

const MoreGames: FunctionComponent<MoreGamesProps> = ({
  title = 'More From Originals',
  btnText = 'View All',
  btnLink = '/originals',
  icon = GameControllerIcon,
  allGames = [],
}) => {
  const navigate = useNavigate();
  const itemsPerPage =
    useBreakpointValue({
      base: 3,
      md: 4,
      lg: 6,
    }) || 6; // fallback in case of SSR or undefined
  // const allGames = Object.values(gameInfo);

  const [currentPage, setCurrentPage] = useState(1);
  const [games, setGames] = useState<GameInfo[]>([]);

  useEffect(() => {
    const startIndex = (currentPage - 1) * (itemsPerPage - 1); // subtract 1 for overlap
    const endIndex = startIndex + itemsPerPage;
    const currentGames = allGames.slice(startIndex, endIndex);
    setGames(currentGames);
  }, [currentPage, itemsPerPage]);

  const renderPaginationButtons = () => {
    return (
      <PaginationRoot
        count={allGames.length}
        pageSize={itemsPerPage}
        page={currentPage}
        maxW='240px'
        onPageChange={e => setCurrentPage(e.page)}>
        <HStack gap='6px'>
          <PaginationPrevTrigger bg={'#4A445A99'} color={'#CBCCD1'} />
          <PaginationNextTrigger bg={'#4A445A99'} color={'#CBCCD1'} />
        </HStack>
      </PaginationRoot>
    );
  };

  return (
    <>
      <Box>
        <Box
          display={'flex'}
          alignItems={'bottom'}
          justifyContent={'space-between'}
          w={'100%'}
          mb={'16px'}>
          <Box display={'flex'} alignItems={'center'} gap={'8px'} w={'100%'}>
            <Image
              src={icon}
              alt={'More Games'}
              w={{ base: '24px', md: '28px' }}
              h={{ base: '24px', md: '28px' }}
            />
            <Text fontSize={{ base: '18px', md: '22px' }} fontWeight={'500'}>
              {title}
            </Text>
          </Box>
          <Box display={'flex'} alignItems={'center'} gap={'16px'}>
            <Button
              onClick={() => navigate(btnLink)}
              bg={'#4A445A99'}
              color={'#CBCCD1'}
              display={{ base: 'none', md: 'block' }}>
              {btnText}
            </Button>
            {renderPaginationButtons()}
          </Box>
        </Box>
        <GameCarousel
          games={games}
          itemsPerPage={itemsPerPage}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          totalItems={allGames.length}
        />
      </Box>
    </>
  );
};

export default MoreGames;
