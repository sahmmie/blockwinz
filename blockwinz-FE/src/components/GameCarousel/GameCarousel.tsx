import { FunctionComponent, useState } from 'react';
import { Box } from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import GameCard from '../GameCard/GameCard';
import { GameInfo } from '@/shared/types/types';
import { useSwipeable } from 'react-swipeable';

interface GameCarouselProps {
  games: GameInfo[];
  itemsPerPage: number;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalItems: number;
}

const MotionBox = motion.create(Box); // ✅ Correct way

const GameCarousel: FunctionComponent<GameCarouselProps> = ({
  games,
  itemsPerPage,
  currentPage,
  setCurrentPage,
  totalItems,
}) => {
  const [direction, setDirection] = useState<1 | -1>(1);
  const carouselWidth = 100 / itemsPerPage - (itemsPerPage < 2 ? 2 : 0);
  const maxPage = Math.ceil(totalItems / itemsPerPage);

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      if (currentPage < maxPage) {
        setDirection(1);
        setCurrentPage(currentPage + 1);
      }
    },
    onSwipedRight: () => {
      if (currentPage > 1) {
        setDirection(-1);
        setCurrentPage(currentPage - 1);
      }
    },
    trackMouse: true,
  });

  return (
    <Box mt={2} overflow='hidden' position='relative' {...swipeHandlers}>
      <AnimatePresence initial={true} custom={direction}>
        <MotionBox
          key={currentPage}
          display='flex'
          gap='16px'
          initial={{ x: direction * 100, opacity: 0, y: 0, scale: 1 }}
          animate={{ x: 0, opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'tween', duration: 0.4, ease: 'linear' }}>
          {games.map((game, index) => (
            <Box
              key={index}
              flex='none'
              w={`${carouselWidth}%`}
              borderRadius='lg'
              boxShadow='md'
              overflow='hidden'>
              <GameCard game={game} />
            </Box>
          ))}
        </MotionBox>
      </AnimatePresence>
    </Box>
  );
};

export default GameCarousel;
