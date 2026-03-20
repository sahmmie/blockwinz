import React, { useEffect, useRef, useState } from 'react';
import { Tag, TagLabel, HStack } from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useGameControlsContext } from '../../hooks/gameControlsContext';

const bounce = keyframes`
  0%,
  50%,
  100% {
    transform: translateY(0);
  }

  20% {
    transform: translateY(20px);
  }
`;

interface BucketsProps {
  totalW: number | string;
  onBucketMouseEnter: (index: number) => void;
  onBucketMouseLeave: () => void;
}

export const Buckets: React.FC<BucketsProps> = ({
  totalW,
  onBucketMouseEnter,
  onBucketMouseLeave,
}) => {
  const { prevResults, bucketData, rows } = useGameControlsContext();
  const isMobile = useIsMobile();
  const singleTagRef = useRef<HTMLDivElement>(null);

  const m = isMobile ? (rows >= 12 ? '0.5px' : '1.2') : '1.2';

  const bucketH = isMobile ? '15px' : rows >= 10 ? '20px' : '30px';

  const textSize = isMobile
    ? rows >= 14
      ? '0.4rem'
      : '0.5rem'
    : rows >= 14
    ? '0.7rem'
    : rows >= 10
    ? '0.85rem'
    : '1rem';

  const mT = isMobile ? '2px' : rows >= 10 ? '2px' : '2px';

  const [animationClasses, setAnimationClasses] = useState<string[]>(
    Array(bucketData.length).fill(''),
  );

  useEffect(() => {
    if (prevResults.length > 0) {
      const lastResultIndex = prevResults[0].index;
      setAnimationClasses(prevClasses => {
        const newClasses = [...prevClasses];
        newClasses[lastResultIndex] = 'bounce';
        return newClasses;
      });

      setTimeout(() => {
        setAnimationClasses(prevClasses => {
          const newClasses = [...prevClasses];
          newClasses[lastResultIndex] = '';
          return newClasses;
        });
      }, 400);
    }
  }, [prevResults]);

  return (
    <HStack
      h={bucketH}
      justify='center'
      mt='4'
      width={totalW}
      marginTop={mT}
      display={'flex'}
      gap={0}>
      {bucketData.map((bucket, index) => (
        <Tag.Root
          h={'100%'}
          minH={bucketH}
          key={index}
          bgColor={bucket.color}
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
          animation={animationClasses[index] === 'bounce' ? `${bounce} 0.4s ease-in-out` : 'none'}
          onMouseEnter={() => onBucketMouseEnter(index)}
          onMouseLeave={onBucketMouseLeave}>
          <TagLabel
            color='white'
            fontWeight={'regular'}
            overflow={'visible'}
            w={'100%'}
            h={'100%'}
            textAlign={'center'}
            display={'flex'}
            justifyContent={'center'}
            alignItems={'center'}
            fontSize={textSize}
            verticalAlign={'middle'}
            whiteSpace={'nowrap'}>
            {bucket.label}
          </TagLabel>
        </Tag.Root>
      ))}
    </HStack>
  );
};

export default Buckets;