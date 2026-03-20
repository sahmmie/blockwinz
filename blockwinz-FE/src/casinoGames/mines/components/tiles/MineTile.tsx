import { Box, Image, Spinner } from '@chakra-ui/react';
import React, { ReactNode } from 'react';
import MineBaseImg from 'assets/icons/mines-images/mine-default.png';
import {
  default as MineSelectedImg,
  default as tileHover,
} from 'assets/icons/mines-images/mine-hover.png';

interface MineTileProps {
  isRevealed: boolean;
  isSelected: boolean;
  content: string | ReactNode;
  hiddenContent?: string | ReactNode;
  onTileClick?: () => void;
  bgColor?: string;
  contentType?: string;
  activeBoard?: boolean;
  isLoading?: boolean;
  isAutoMode?: boolean;
}

const MineTile: React.FC<MineTileProps> = ({
  isRevealed,
  isSelected,
  content,
  onTileClick,
  bgColor = '#484D5B',
  activeBoard = false,
  isLoading = false,
  isAutoMode = false,
  contentType,
}) => {
  const getBorderStyle = () => {
    const isBomb = contentType === 'bomb';

    if (isAutoMode) {
      if (!isRevealed && isSelected) {
        return { border: `1px solid ${'green'}` };
      }
    } else {
      if (isSelected && isRevealed && isBomb) {
        return { border: `1px solid ${'red'}` };
      }
    }

    return undefined;
  };

  const borderStyle = getBorderStyle();

  const handleDragStart = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <>
      {activeBoard ? (
        <Box
          style={borderStyle}
          borderRadius={8}
          bg={bgColor}
          onDragStart={handleDragStart}
          display='flex'
          alignItems='center'
          justifyContent='center'
          cursor='pointer'
          onClick={onTileClick}
          userSelect={'none'}
          transition='transform 0.1s ease-in-out'
          _active={{ transform: 'scale(0.95)' }}
          _hover={
            !isRevealed ? { '& > img': { content: `url(${tileHover})` } } : {}
          }>
          {isLoading ? (
            <Spinner color={'accent.bg'} />
          ) : isRevealed ? (
            content
          ) : (
            <Image
              _hover={{
                transform: 'scale(0.95)',
                transition: 'transform 0.1s ease-in-out',
              }}
              style={{
                borderRadius: '8px',
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
              src={isSelected ? MineSelectedImg : MineBaseImg}
              alt='tile'
            />
          )}
        </Box>
      ) : (
        <Box
          borderRadius={10}
          bg={bgColor}
          display='flex'
          alignItems='center'
          justifyContent='center'
          cursor='pointer'
          transition='transform 0.1s ease-in-out'>
          {isLoading ? (
            <Spinner color={'accent.bg'} />
          ) : (
            <Image src={MineBaseImg} alt='tile' />
          )}
        </Box>
      )}
    </>
  );
};

export default MineTile;
