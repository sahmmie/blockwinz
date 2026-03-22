import { Button } from '@/components/ui/button';
import { Box } from '@chakra-ui/react';
import { FunctionComponent, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import CheckMarkIcon from '../../assets/icons/checkmark-icon.svg';
import FavouriteIcon from '../../assets/icons/favourite-icon.svg';
import FavouriteWhiteIcon from '../../assets/icons/favourite-white-icon.svg';
import usePageData from '@/hooks/usePageData';
import useModal, { ModalProps } from '@/hooks/useModal';
import Fairness from '@/pages/Fairness/Fairness';
import { patchFairnessUrlParams, PF_KEYS } from '@/pages/Fairness/fairnessUrlParams';
import { useFavouritesStore } from '@/hooks/useFavourite';
import SettingsPopover from '@/components/SettingsPopover/SettingsPopover';
import { GameInfo } from '@/shared/types/types';

interface GameDashboardProps {
  renderConfig: JSX.Element;
  renderGame: JSX.Element;
  game: GameInfo;
}

const GameDashboard: FunctionComponent<GameDashboardProps> = ({
  game,
  renderConfig,
  renderGame,
}) => {
  const { setCurrentGame } = usePageData();
  const { openModal } = useModal();
  const [, setSearchParams] = useSearchParams();

  const { addFavourite, removeFavourite, isLoading, favourites } =
    useFavouritesStore();
  const isFavourite = favourites.some(fav => fav.id === game.id);

  useEffect(() => {
    setCurrentGame(game);
  }, [game]);

  const openFairnessModal = () => {
    setSearchParams(
      prev =>
        patchFairnessUrlParams(prev, {
          [PF_KEYS.TAB]: 'verify',
          [PF_KEYS.GAME]: String(game.id),
        }),
      { replace: true },
    );
    const modalConfig: ModalProps = {
      size: 'lg',
      hideCloseButton: false,
      hideHeader: true,
      width: { base: '90%', md: '600px' },
      backgroundColor: '#000A27',
      autoCloseAfter: 0,
      left: { base: '0', md: '20' },
      backdrop: true,
      scrollBehavior: 'inside',
    };

    openModal(
      <Fairness preSelectedSegment='verify' initialGameOverride={game} />,
      'Fairness',
      modalConfig,
    );
  };

  const handleFavouriteGame = () => {
    if (isLoading) return;
    if (isFavourite) {
      removeFavourite(game);
    } else {
      addFavourite(game);
    }
  };

  return (
    <>
      <Box
        w={'100%'}
        minH={{ base: 'inherit', md: '650px' }}
        bg={'#151832'}
        borderTopRadius={{ base: '8px', md: '8px' }}
        display={'flex'}
        flexDirection={{ base: 'column-reverse', md: 'row' }}>
        <Box
          mb={{ base: '26px', md: '0px' }}
          w={{ base: '100%', md: '4/12' }}
          borderRight={{ md: '0.2px solid #FFFFFF', base: 'none' }}>
          {renderConfig}
        </Box>
        <Box w={'100%'} pl={{ base: '0', md: '16px' }}>
          {renderGame}
        </Box>
      </Box>

      <Box
        w={'100%'}
        h={'90px'}
        bg={'#151832'}
        borderBottomRadius={{ base: '8px', md: '8px' }}
        borderTop={'0.5px solid #FFFFFF'}
        display={'flex'}
        alignItems={'center'}
        justifyContent={'space-between'}>
        <Box
          display={'flex'}
          alignItems={'center'}
          w={'100%'}
          gap={'16px'}
          pl={{ base: '16px', md: '28px' }}>
          <Button
            p={'unset'}
            bg={'unset'}
            onClick={handleFavouriteGame}
            disabled={isLoading}>
            <img
              src={isFavourite ? FavouriteWhiteIcon : FavouriteIcon}
              alt={'favourite-icon'}
              style={{ width: '24px', height: '24px' }}
            />
          </Button>
          <SettingsPopover />
        </Box>

        <Box
          mr={{ base: '0px', md: '26px' }}
          w={'100%'}
          display={'flex'}
          justifyContent={'end'}
          alignItems={'center'}>
          <Button
            onClick={openFairnessModal}
            bg={'none'}
            textWrap={'wrap'}
            lineHeight={'30px'}
            fontSize={'14px'}
            fontWeight={'600'}
            color={'#ECF0F1'}
            unselectable='off'
            textDecor={'underline'}
            cursor={'pointer'}>
            Provably Fair
            <img
              src={CheckMarkIcon}
              alt={'keyboard-icon'}
              style={{ width: '20px', height: '20px' }}
            />
          </Button>
        </Box>
      </Box>
    </>
  );
};

export default GameDashboard;
