import React, { useEffect, useRef, useState } from 'react';
import { Tag, TagLabel, HStack } from '@chakra-ui/react';
import { useGameControlsContext } from '../../hooks/gameControlsContext';
import { useIsMobile } from '@/hooks/useIsMobile';

interface BucketsProps {
  onBucketMouseEnter: (index: number) => void;
  onBucketMouseLeave: () => void;
}

export const Buckets: React.FC<BucketsProps> = ({
  onBucketMouseEnter,
  onBucketMouseLeave,
}) => {
  const { prevResults, mulData, isSpinning } = useGameControlsContext();
  const isMobile = useIsMobile();
  const singleTagRef = useRef<HTMLDivElement>(null);
  const m = '2';
  const bucketH = '50px';
  const textSize = isMobile ? '0.75rem' : '1rem';
  const mT = '12px';
  const bucketColor = '#22223E';
  const [animationClasses, setAnimationClasses] = useState<string[]>(
    Array(mulData.length).fill(''),
  );
  const [filledBucket, setFilledBucket] = useState<number | null>(null);

  useEffect(() => {
    if (prevResults.length > 0) {
      const lastResultIndex = prevResults[0].index;
      setAnimationClasses(prevClasses => {
        const newClasses = [...prevClasses];
        newClasses[lastResultIndex] = 'bounce';
        return newClasses;
      });
      setFilledBucket(lastResultIndex);
      setTimeout(() => {
        setAnimationClasses(prevClasses => {
          const newClasses = [...prevClasses];
          newClasses[lastResultIndex] = '';
          return newClasses;
        });
      }, 200);
    }
  }, [prevResults]);

  useEffect(() => {
    if (isSpinning) {
      setFilledBucket(null);
    }
  }, [isSpinning]);

  return (
    <HStack
      h={bucketH}
      justify='center'
      mt='4'
      width={'100%'}
      marginTop={mT}
      display={'flex'}
      gap={0}>
      {mulData.map((mul, index) => (
        <Tag.Root
          key={index}
          position='relative'
          overflow='hidden'
          h={'100%'}
          minH={bucketH}
          bgColor={bucketColor}
          borderRadius='md'
          mx={1}
          flex={'1'}
          minWidth={0}
          display={'flex'}
          justifyContent={'center'}
          alignItems={'center'}
          verticalAlign={'middle'}
          ref={singleTagRef}
          p={0}
          m={m}
          className={animationClasses[index]}
          _before={{
            content: '""',
            position: 'absolute',
            bottom: '5%', // Start above the static 5%
            left: 0,
            width: '100%',
            height: filledBucket === index ? '95%' : '0%',
            backgroundColor: `${mul.color}40`, // Light version for the 95%
            transition: 'height 0.2s ease',
            zIndex: 1,
          }}
          _after={{
            content: '""',
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '100%',
            height: '5%', // Static 5% always visible
            backgroundColor: mul.color,
            zIndex: 2, // Higher z-index to stay on top
          }}
          _hover={{
            _before: {
              height: '95%', // Fill the 95% area with lighter color
            },
          }}
          onMouseEnter={() => onBucketMouseEnter(mul.mul)}
          onMouseLeave={onBucketMouseLeave}>
          <TagLabel
            color='white'
            fontWeight={'bold'}
            overflow={'visible'}
            w={'100%'}
            h={'100%'}
            textAlign={'center'}
            display={'flex'}
            justifyContent={'center'}
            alignItems={'center'}
            fontSize={textSize}
            verticalAlign={'middle'}
            whiteSpace={'nowrap'}
            position='relative'
            zIndex={2}>
            {mul.mul.toFixed(2)}x
          </TagLabel>
        </Tag.Root>
      ))}
    </HStack>
  );
};

export default Buckets;
