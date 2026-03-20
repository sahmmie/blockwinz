import { Button } from '@/components/ui/button';
import usePageData from '@/hooks/usePageData';
import { Box, Text } from '@chakra-ui/react';
import { FunctionComponent, useRef, useState, useLayoutEffect } from 'react';
import { useIsMobile } from '@/hooks/useIsMobile';
import { GameCategoryEnum } from '@/shared/enums/gameType.enum';
import { useNavigate } from 'react-router-dom';

interface GameInfoProps {}

const MOBILE_DESC_HEIGHT = 60; // px

const GameInfo: FunctionComponent<GameInfoProps> = () => {
  const { currentGame } = usePageData();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  // Show more/less logic
  const descRef = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [showToggle, setShowToggle] = useState(false);

  useLayoutEffect(() => {
    if (descRef.current) {
      if (isMobile) {
        setShowToggle(descRef.current.scrollHeight > MOBILE_DESC_HEIGHT);
      } else {
        setShowToggle(false);
      }
    }
  }, [currentGame?.description, isMobile]);

  if (!currentGame) {
    return null;
  }

  const renderButton = () => {
    if (currentGame.category === GameCategoryEnum.ORIGINALS) {
      return (
        <Button
          bg={'#4A445A99'}
          color={'#CBCCD1'}
          onClick={() => navigate('/games?type=originals')}>
          Originals
        </Button>
      );
    }
    if (currentGame.category === GameCategoryEnum.MULTIPLAYER) {
      return (
        <Button
          bg={'#4A445A99'}
          color={'#CBCCD1'}
          onClick={() => navigate('/games?type=multiplayer')}>
          Multiplayer
        </Button>
      );
    }
    return null;
  };

  return (
    <>
      <Box
        w={'100%'}
        bg={'#151832'}
        borderRadius={'8px'}
        px={'10px'}
        py={'12px'}
        display={'flex'}>
        <Box mr={'14px'}>
          <img
            src={currentGame.image}
            alt={currentGame.name}
            style={{ width: '112px', height: '140px', objectFit: 'contain' }}
          />
        </Box>
        <Box w={'100%'}>
          <Box
            display={'flex'}
            alignItems={'center'}
            justifyContent={'space-between'}>
            <Text
              fontSize={'24px'}
              fontWeight={'500'}
              lineHeight={'30px'}
              textWrap={'nowrap'}>
              {currentGame.name}
            </Text>
            <Box display={'flex'} gap={'12px'} ml={'12px'}>
              {renderButton()}
              <Button
                bg={'#4A445A99'}
                color={'#CBCCD1'}
                display={{ base: 'none', md: 'block' }}>
                Recently Played
              </Button>
            </Box>
          </Box>
          <Box
            fontSize={'14px'}
            lineHeight={'22px'}
            mt={'12px'}
            position='relative'
            maxW='100%'
            style={
              expanded || !isMobile
                ? {}
                : {
                    maxHeight: `${MOBILE_DESC_HEIGHT}px`,
                    overflow: 'hidden',
                  }
            }>
            <Box
              ref={descRef}
              as='div'
              style={{
                whiteSpace: 'pre-line',
                wordBreak: 'break-word',
              }}>
              {currentGame.description}
            </Box>
            {/* Gradient overlay for fade-out effect on mobile when not expanded */}
            {!expanded && showToggle && isMobile && (
              <Box
                display='block'
                position='absolute'
                left={0}
                right={0}
                bottom={0}
                height='32px'
                bg='linear-gradient(180deg, rgba(21,24,50,0) 0%, #151832 90%)'
                pointerEvents='none'
              />
            )}
          </Box>
          {/* Show more/less button */}
          {showToggle && isMobile && (
            <Button
              color='#00DD25'
              fontSize='14px'
              mt='2px'
              px={0}
              bg='none'
              _hover={{ textDecoration: 'underline', bg: 'none' }}
              display='inline-block'
              onClick={() => setExpanded(e => !e)}>
              {expanded ? 'Show less' : 'Show more'}
            </Button>
          )}
        </Box>
      </Box>
    </>
  );
};

export default GameInfo;
