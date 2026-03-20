import React, { useRef, useState, useEffect } from 'react';
import { Box, useBreakpointValue, Spinner, Text, VStack } from '@chakra-ui/react';
import RenderComponent from '../Renderer/RenderComponent';
import { PreviousResults } from '../PreviousResults/PreviousResults';
import BucketsWithHover from '../BucketsWithHover/BucketsWithHover';
import { useGameControlsContext } from '../../hooks/gameControlsContext';
import { useHotKeys } from '../../hooks/useHotKeys';

const Game: React.FC = () => {
  const { bucketsContainerP, gameDataLoading } = useGameControlsContext();
  const isMobile = useBreakpointValue({ base: true, lg: false, md: false });
  const rendererRef = useRef<HTMLDivElement>(null);
  const [totalW, setTotalW] = useState<number | string>('100%');

  useHotKeys();

  useEffect(() => {
    if (rendererRef.current) {
      const clientWidth =
        rendererRef.current.clientWidth ||
        rendererRef.current.parentElement?.clientWidth ||
        0;
      const calculatedWidth =
        Math.max(clientWidth - 2 * bucketsContainerP, 0) || '100%';
      setTotalW(calculatedWidth);
    } else {
      setTotalW('100%');
    }
  }, [bucketsContainerP]);

  return (
    <Box
      h={'100%'}
      py={isMobile ? 0 : 16}
      px={8}
      position='relative'
      overflow='hidden'
      display={'flex'}
      flexDir={'column'}
      alignItems={'center'}
      justifyContent={'center'}
      className='renderboxer'
      marginBottom={isMobile ? '16px' : '0'}
      minH={isMobile ? '0px' : '600px'}>
      
      {/* Loading Overlay */}
      {gameDataLoading && (
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bg="rgba(0, 0, 0, 0.8)"
          display="flex"
          alignItems="center"
          justifyContent="center"
          zIndex={1000}
        >
          <VStack gap={4}>
            <Spinner size="xl" color="#00DD25" />
            <Text color="white" fontSize="lg" fontWeight="medium">
              Loading game data...
            </Text>
          </VStack>
        </Box>
      )}
      
      <Box
        mt={{ base: '16px', md: 0 }}
        className='renderbox'
        position='relative'
        width='100%'
        h='100%'
        aspectRatio={4 / 3}>
        <RenderComponent ref={rendererRef} />
        <PreviousResults />
      </Box>
      <BucketsWithHover totalW={totalW} />
    </Box>
  );
};

export default Game;
