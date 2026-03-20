import React, { useRef } from 'react';
import { Box } from '@chakra-ui/react';
import RenderComponent from '../Renderer/RenderComponent';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useHotKeys } from '../../hooks/useHotKeys';
import BucketsWithHover from '../BucketsWithHover/BucketsWithHover';
import { useGameControlsContext } from '../../hooks/gameControlsContext';
import { TagGroup } from '@/components/TagGroup';

const Game: React.FC = () => {
  const isMobile = useIsMobile();
  const rendererRef = useRef<HTMLDivElement>(null);
  const { animSpeed,tagResults } = useGameControlsContext();  

  useHotKeys();

  const renderTagResults = () => (
    <Box
      w="100%"
      display="flex"
      justifyContent="flex-end"
      pr={{ md: '32px', base: '16px' }}
      h={{ base: '32px', md: '40px' }}>
      <TagGroup
        tags={tagResults}
        duration={animSpeed / 1000}
      />
    </Box>
  );

  return (
    <Box
    py={{ base: '16px', md: '24px' }}
      h={'100%'}
      px={{ base: '0', md: '8px' }}
      position='relative'
      overflow='hidden'
      display={'flex'}
      flexDir={'column'}
      alignItems={'center'}
      justifyContent={'center'}
      className='renderboxer'
      marginBottom={isMobile ? '16px' : '0'}
      minH={isMobile ? '0px' : '600px'}>
      {renderTagResults()}
      <Box
        className='renderbox'
        position='relative'
        mt={{ base: '16px', md: 0 }}
        width='100%'
        h='100%'
        aspectRatio={4 / 3}>
        <RenderComponent ref={rendererRef} />
      </Box>
      <BucketsWithHover />
    </Box>
  );
};

export default Game;
