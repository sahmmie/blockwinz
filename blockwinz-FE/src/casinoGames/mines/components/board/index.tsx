import { Box, Flex, Image, SimpleGrid } from '@chakra-ui/react';
import React, { useEffect } from 'react';
import bombImg from 'assets/icons/mines-images/mine-bomb.png';
import disabledBombImg from 'assets/icons/mines-images/mine-bomb-disabled.png';
import blankImgLarge from 'assets/icons/mines-images/mine-default.png';
import diamondImg from 'assets/icons/mines-images/mine-diamond.png';
import disabledDiamondImg from 'assets/icons/mines-images/mine-diamond-disabled.png';
import blankImgSmall from 'assets/icons/mines-images/mine-default-small.png';
import { useGridSize } from './useGridSize';
import { ITile } from '../../types';
import { GameMode } from '@blockwinz/shared';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useSound } from '../../hooks/useSound';
import { BOARD_SIZE } from '../../constants';
import MineTile from '../tiles/MineTile';
import { useGameControls } from '../../context/GameControlsContext';
import useModal from '@/hooks/useModal';
import GameStatusModal, {
  GameStatusModalProps,
  modalConfig,
} from '@/components/Modal/GameStatusModal';
import DiamondSymbolIcon from '@/assets/icons/mine-diamond-symbol-icon.svg';

const getTileImage = (tile: ITile, isMobile?: boolean) => {
  const blankImg = isMobile ? blankImgSmall : blankImgLarge;
  if (!tile.isRevealed) {
    return blankImg;
  }

  switch (tile.content) {
    case 'bomb':
      return tile.isSelected ? bombImg : disabledBombImg;
    case 'diamond':
      return tile.isSelected ? diamondImg : disabledDiamondImg;
    default:
      return blankImg;
  }
};

export const MinesGameBoard: React.FC = () => {
  const isMobile = useIsMobile();
  const {
    state: {
      activeBet,
      activeBoard,
      tiles,
      totalProfit,
      multiplier,
      showPopUp,
      betType,
      activeAutoBet,
      isLoadingTile,
      currency,
    },
    actions: {
      handleRevealTile,
      handleSelectTile,
      setHasError,
      setErrorMsg,
      setIsLoadingTile,
    },
  } = useGameControls();

  const { play } = useSound();
  const { gridSize, parentRef, heightPercentage } = useGridSize();
  const { openModal } = useModal();

  const selectedTiles = tiles.filter(tile => tile.isSelected).length;

  useEffect(() => {
    const props: GameStatusModalProps = {
      title: `x${multiplier.toFixed(2)}`,
      winAmount: totalProfit,
      currency: currency,
      rightText: `${selectedTiles}`,
      rightIcon: DiamondSymbolIcon,
    };

    if (showPopUp) {
      openModal(<GameStatusModal {...props} />, undefined, modalConfig);
    }
  }, [showPopUp]);

  const canClickTile = (index: number) => {
    if (betType === GameMode.Manual) {
      return activeBet && !tiles[index].isRevealed;
    } else {
      return !activeAutoBet;
    }
  };

  const handleTileClick = async (index: number) => {
    const isLoading = Object.values(isLoadingTile).some(value => value);
    const tileSelected = tiles[index].isSelected;

    if ((betType === GameMode.Manual && tileSelected) || isLoading) {
      return false;
    }

    if (!canClickTile(index) && !activeBet) {
      setErrorMsg({
        title: 'Start Bet',
        description: 'Please start a bet first',
      });
      setHasError(true);
      return;
    }

    try {
      play('tileClick');
      setIsLoadingTile(index, true);

      if (betType === GameMode.Manual) {
        await handleRevealTile({ tileIndex: index });
      } else {
        await handleSelectTile({ tileIndex: index });
      }
      setIsLoadingTile(index, false);
    } catch (error) {
      setIsLoadingTile(index, false);
      console.error('Error handling tile click:', error);
    }
  };

  const renderTile = (tile: ITile, index: React.Key | null | undefined) => (
    <MineTile
      key={index}
      isLoading={isLoadingTile?.[index as number] || false}
      isRevealed={tile.isRevealed}
      contentType={tile.content}
      isSelected={tile.isSelected}
      content={
        <Image
          style={{ borderRadius: '8px' }}
          src={getTileImage(tile, isMobile)}
          alt={tile.content}
          objectFit='cover'
          width='100%'
          height='100%'
        />
      }
      onTileClick={() => handleTileClick(index as number)}
      activeBoard={activeBoard}
      isAutoMode={betType === GameMode.Auto}
    />
  );

  const renderGrid = () => (
    <Box width={gridSize} height={gridSize}>
      <SimpleGrid columns={BOARD_SIZE} gap={'6px'} width='100%' height='100%'>
        {tiles?.map(renderTile)}
      </SimpleGrid>
    </Box>
  );

  return (
    <Box
      height='100%'
      display='flex'
      flexDir='column'
      p={isMobile ? '16px 0px 0px 0px' : '12px 0 0px 0'}>
      <Box height='100%' width='100%'>
        <Flex
          alignItems={'center'}
          ref={parentRef}
          position='relative'
          height={`${heightPercentage}%`}
          justifyContent='center'>
          {renderGrid()}
          {/* TODO: Max payout pop needs to be implemented */}
          {/* <MaxPayoutModal
            isOpen={modalIsOpen}
            onClose={closeModal}
            onCloseComplete={handleCashout}
          /> */}
        </Flex>
      </Box>
    </Box>
  );
};
