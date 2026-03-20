import { Box, Flex, SimpleGrid } from '@chakra-ui/react';
import BaseInputs from '../BaseInputs';
import { useGameInputsContext } from '../../hooks/useGameInputsContext';
import useGameResult from '../../hooks/useGameResult';
import { generateKenoResult } from '@/shared/utils/fairLogic';
import { useIsMobile } from '@/hooks/useIsMobile';
import { GameButton } from '@/casinoGames/keno/components/GameButtons';

const TOTAL_NUMBERS = 40;

const KenoResult = () => {
  const { baseInputs } = useGameInputsContext();
  const result = useGameResult(generateKenoResult, baseInputs) || [];
  const isMobile = useIsMobile();

  const renderGameButton = (number: number) => (
    <GameButton
      key={number}
      number={number}
      isSelected={false}
      buttonType={result.includes(number) ? 'win' : 'default'}
      disabled={true}
      isInteractive={false}
    />
  );

  const renderGameButtonsGrid = () => (
    <Box width='100%' maxWidth='756px' height='100%'>
      <SimpleGrid columns={8} gap='12px' width='100%' aspectRatio='8/5'>
        {Array.from({ length: TOTAL_NUMBERS }, (_, i) =>
          renderGameButton(i + 1),
        )}
      </SimpleGrid>
    </Box>
  );

  return (
    <Box display='flex' flexDir='column' height='100%' p={2}>
      <Box
        height='100%'
        width='100%'
        p={isMobile ? '16px 12px 20px 12px' : '32px 0 24px 0'}>
        <Flex justifyContent='center' position='relative' height='100%'>
          {renderGameButtonsGrid()}
        </Flex>
      </Box>
      <BaseInputs />
    </Box>
  );
};

export default KenoResult;
