import { Box, Grid } from '@chakra-ui/react';
import { FunctionComponent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GameInfo } from '@/shared/types/types';
import GameCard from '@/components/GameCard/GameCard';

interface MoreGamesSlideProps {
  games: GameInfo[];
  itemsPerPage: number;
}

const itemVariants = {
  hidden: { opacity: 0, x: 50 }, // Start off-screen to the right
  visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: 'easeOut' } },
  exit: { opacity: 0, x: -50, transition: { duration: 0.3, ease: 'easeIn' } },
};

const animateExit = {
  x: '-100%',
  opacity: 0,
  transition: { duration: 0.4, ease: 'easeIn' },
};

const animateEnter = {
  x: 0,
  opacity: 1,
  transition: { duration: 0.5, ease: 'easeOut' },
};

const MoreGamesSlide: FunctionComponent<MoreGamesSlideProps> = ({
  games,
  itemsPerPage,
}) => {
  return (
    <Box w='100%' overflow='hidden'>
      <AnimatePresence mode='wait'>
        <motion.div
          key={JSON.stringify(games)} // Force re-render when games change
          initial={{ x: '100%', opacity: 0 }} // Start off-screen
          animate={animateEnter}
          exit={animateExit}>
          <Grid templateColumns={`repeat(${itemsPerPage}, 1fr)`} gap={4}>
            {games.map((game, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                initial='hidden'
                animate='visible'
                exit='exit'>
                <GameCard game={game} key={index} />
              </motion.div>
            ))}
          </Grid>
        </motion.div>
      </AnimatePresence>
    </Box>
  );
};

export default MoreGamesSlide;
