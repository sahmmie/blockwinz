import BwIcon from '@/assets/bw-icon-only.svg';
import GreenFireIcon from '@/assets/icons/green-fire-icon.svg';
import NewReleasesIcon from '@/assets/icons/new-releases-icon.svg';
import MultiplayerIcon from '@/assets/icons/multiplayer-icon.svg';
import bgImg from '@/assets/icons/home-bg-image.svg';
import LiveCasinoIcon from '@/assets/icons/live-casino-icon.svg';
import Bets from '@/casinoGames/bets/Bets';
import MoreGames from '@/casinoGames/moreGames/MoreGames';
import useAuth from '@/hooks/useAuth';
import usePageData from '@/hooks/usePageData';
import { Box } from '@chakra-ui/react';
import { FunctionComponent, useEffect, useState } from 'react';
import NoAuthBanner from './components/NoAuthBanner';
import AuthBanner from './components/AuthBanner';
import { motion, AnimatePresence } from 'framer-motion';
import { originalGamesInfo } from '@/shared/constants/originalGamesInfo.constant';
import { useIsMobile } from '@/hooks/useIsMobile';
import { buttons } from './home-data';

interface HomeProps {}

const MotionBox = motion.create(Box);

const Home: FunctionComponent<HomeProps> = () => {
  const { setTitle } = usePageData();
  const { isAuthenticated } = useAuth();
  const [activeButton, setActiveButton] = useState<string>(buttons[0].value);
  const isMobile = useIsMobile();

  useEffect(() => {
    setTitle('Blockwinz');
  }, []);

  const sections = [
    {
      key: 'popular',
      title: 'Popular Games',
      btnLink: '/originals',
      icon: GreenFireIcon,
      data: Object.values(originalGamesInfo).sort(() => Math.random() - 0.5),
    },
    {
      key: 'originals',
      title: 'Blockwinz Originals',
      btnLink: '/originals',
      icon: BwIcon,
      data: Object.values(originalGamesInfo),
    },
    {
      key: 'multiplayer',
      title: 'Multiplayer',
      btnLink: '/multiplayer',
      icon: MultiplayerIcon,
      data: Object.values(originalGamesInfo).sort(() => Math.random() - 0.5),
    },
    {
      key: 'live',
      title: 'Live games',
      btnLink: '/live-games',
      icon: LiveCasinoIcon,
      data: Object.values(originalGamesInfo).sort(() => Math.random() - 0.5),
    },
    {
      key: 'new-releases',
      title: 'New Releases',
      btnLink: '/new-releases',
      icon: NewReleasesIcon,
      data: Object.values(originalGamesInfo).sort(() => Math.random() - 0.5),
    },
  ];

  // Move active section to the top
  const sortedSections = [...sections].sort((a, b) => {
    return a.key === activeButton ? -1 : b.key === activeButton ? 1 : 0;
  });

  return (
    <Box>
      <Box
        display='flex'
        flexDir={{ base: 'row', md: !isAuthenticated ? 'row' : 'column' }}
        w='100%'
        minH={{ base: '100%', md: '400px' }}
        style={{
          backgroundImage:
            isMobile && isAuthenticated ? 'none' : `url(${bgImg})`,
          borderRadius: '8px',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'bottom',
        }}>
        {!isAuthenticated && <NoAuthBanner />}
        {isAuthenticated && (
          <AuthBanner
            activeButton={activeButton}
            setActiveButton={setActiveButton}
          />
        )}
      </Box>

      <AnimatePresence mode='popLayout'>
        {sortedSections.map(section => (
          <MotionBox
            key={section.key}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            mt='32px'>
            <MoreGames
              title={section.title}
              btnLink={section.btnLink}
              icon={section.icon}
              allGames={section.data}
            />
          </MotionBox>
        ))}
      </AnimatePresence>

      <Box mt='32px'>
        <Bets />
      </Box>
    </Box>
  );
};

export default Home;
