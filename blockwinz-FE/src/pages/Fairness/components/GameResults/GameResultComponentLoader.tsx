import { GameTypeEnum } from '@blockwinz/shared';
import { Box, Spinner, Text } from '@chakra-ui/react';
import {
  FunctionComponent,
  LazyExoticComponent,
  Suspense,
  lazy,
  useEffect,
  useRef,
  useState,
} from 'react';

interface GameComponentProps {}

const componentMapping: Partial<
  Record<
    GameTypeEnum,
    | LazyExoticComponent<FunctionComponent<GameComponentProps>>
    | FunctionComponent<GameComponentProps>
  >
> = {
  [GameTypeEnum.DiceGame]: lazy(() =>
    import('./DiceResult').then(module => ({
      default: module.default as FunctionComponent<GameComponentProps>,
    })),
  ),
  [GameTypeEnum.LimboGame]: lazy(() =>
    import('./LimboResult').then(module => ({
      default: module.default as FunctionComponent<GameComponentProps>,
    })),
  ),
  [GameTypeEnum.MinesGame]: lazy(() =>
    import('./MinesResult').then(module => ({
      default: module.default as FunctionComponent<GameComponentProps>,
    })),
  ),
  [GameTypeEnum.KenoGame]: lazy(() =>
    import('./KenoResult').then(module => ({
      default: module.default as FunctionComponent<GameComponentProps>,
    })),
  ),
  [GameTypeEnum.PlinkoGame]: lazy(() =>
    import('./PlinkoResult').then(module => ({
      default: module.default as FunctionComponent<GameComponentProps>,
    })),
  ),
  [GameTypeEnum.WheelGame]: lazy(() =>
    import('./WheelResult').then((module) => ({
      default: module.default as FunctionComponent<GameComponentProps>,
    }))
  ),
};

interface GameComponentLoaderProps {
  selectedGame: GameTypeEnum;
}

function GameComponentLoader({ selectedGame }: GameComponentLoaderProps) {
  const Component = componentMapping[selectedGame];
  const [height, setHeight] = useState(150);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      const resizeObserver = new ResizeObserver(entries => {
        for (const entry of entries) {
          setHeight(entry.contentRect.height);
        }
      });

      resizeObserver.observe(contentRef.current);

      return () => {
        resizeObserver.disconnect();
      };
    }
  }, [selectedGame]);

  const noVerificationAvailable = () => (
    <Box
      mt={12}
      display='flex'
      flexDirection='column'
      alignItems='center'
      justifyContent='center'
      height='100%'>
      <Box mb={4}>
        <Text fontWeight={500} fontSize={{ md: '16px', base: '14px' }}>
          This game is not available for verification at this time.
        </Text>
      </Box>
    </Box>
  );

  return (
    <Box
      height={Component ? `${height}px` : '100%'}
      transition='height 0.3s ease-in-out'
      overflow='hidden'
      width='100%'>
      <Box
        ref={contentRef}
        width='100%'
        display='flex'
        flexDirection='column'
        gap={'12px'}>
        <Suspense
          fallback={
            <Box height='150px' width='100%'>
              <Spinner />
            </Box>
          }>
          {Component ? <Component /> : noVerificationAvailable()}
        </Suspense>
      </Box>
    </Box>
  );
}

export default GameComponentLoader;
