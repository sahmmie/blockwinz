import React, { useState, useRef } from 'react';
import { Box } from '@chakra-ui/react';
import Buckets from '../Buckets/Buckets';
import HoverInfo from '../HoverInfo/HoverInfo';

const BucketsWithHover: React.FC = () => {
  const [hoveredBucketIndex, setHoveredBucketIndex] = useState<number | null>(
    null,
  );
  const containerRef = useRef<HTMLDivElement>(null);

  const handleBucketMouseEnter = (index: number) => {
    setHoveredBucketIndex(index);
  };

  const handleBucketMouseLeave = () => {
    setHoveredBucketIndex(null);
  };

  return (
    <Box
    px={{ base: '12px', md: '0' }}
      position='relative'
      width='100%'
      ref={containerRef}
      display={'flex'}
      justifyItems={'center'}
      justifyContent={'center'}>
      {hoveredBucketIndex !== null && (
        <Box
          position='absolute'
          zIndex={10}
          display={'flex'}
          justifyContent={'center'}>
          <HoverInfo multiplier={hoveredBucketIndex} />
        </Box>
      )}
      <Buckets
        onBucketMouseEnter={handleBucketMouseEnter}
        onBucketMouseLeave={handleBucketMouseLeave}
      />
    </Box>
  );
};

export default BucketsWithHover;
