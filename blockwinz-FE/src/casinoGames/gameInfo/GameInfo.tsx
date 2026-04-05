import { Button } from '@/components/ui/button';
import usePageData from '@/hooks/usePageData';
import { Box, Text } from '@chakra-ui/react';
import { FunctionComponent, useRef, useState, useLayoutEffect } from 'react';
import { useIsMobile } from '@/hooks/useIsMobile';
import { GameCategoryEnum, MultiplayerGameTypeEnum } from '@blockwinz/shared';
import { useNavigate } from 'react-router-dom';
import QuoridorHowToPlay from '@/casinoGames/quoridor/components/QuoridorHowToPlay';
import {
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogHeader,
  DialogRoot,
  DialogTitle,
} from '@/components/ui/dialog';

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
  const [howToPlayOpen, setHowToPlayOpen] = useState(false);

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

  const isQuoridorHowToPlay =
    currentGame.id === MultiplayerGameTypeEnum.QuoridorGame;
  const showHowToPlay = Boolean(currentGame.howToPlay) || isQuoridorHowToPlay;

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
            justifyContent={'space-between'}
            flexWrap='wrap'
            gap={2}>
            <Text
              fontSize={'24px'}
              fontWeight={'500'}
              lineHeight={'30px'}
              wordBreak='break-word'>
              {currentGame.name}
            </Text>
            <Box
              display={'flex'}
              gap={'12px'}
              ml={{ base: 0, md: '12px' }}
              flexWrap='wrap'
              justifyContent='flex-end'>
              {showHowToPlay ? (
                <Button
                  bg={'#4A445A99'}
                  color={'#CBCCD1'}
                  onClick={() => setHowToPlayOpen(true)}>
                  How to play
                </Button>
              ) : null}
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

      {showHowToPlay ? (
        <DialogRoot
          open={howToPlayOpen}
          onOpenChange={({ open }) => setHowToPlayOpen(open)}
          placement='center'
          lazyMount
          size='lg'
          scrollBehavior='inside'>
          <DialogContent
            maxW={
              isQuoridorHowToPlay
                ? 'min(100vw - 24px, 680px)'
                : 'min(100vw - 24px, 520px)'
            }
            p={0}
            bg='#151832'
            borderWidth='1px'
            borderColor='whiteAlpha.200'>
            <DialogHeader px={6} pt={6} pb={2} position='relative'>
              <DialogTitle fontSize='lg' fontWeight='700' color='white' pr={10}>
                How to play — {currentGame.name}
              </DialogTitle>
              <DialogCloseTrigger onClick={() => setHowToPlayOpen(false)} />
            </DialogHeader>
            <DialogBody px={6} pb={6} pt={0}>
              {isQuoridorHowToPlay ? (
                <QuoridorHowToPlay />
              ) : (
                <Text
                  fontSize='sm'
                  color='gray.200'
                  lineHeight='tall'
                  whiteSpace='pre-line'>
                  {currentGame.howToPlay ?? ''}
                </Text>
              )}
            </DialogBody>
          </DialogContent>
        </DialogRoot>
      ) : null}
    </>
  );
};

export default GameInfo;
