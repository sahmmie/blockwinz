import { Box } from '@chakra-ui/react';
import { FC } from 'react';

import BaseInputs from '../BaseInputs';
import { useGameInputsContext } from '../../hooks/useGameInputsContext';
import useGameResult from '../../hooks/useGameResult';
import { generateDiceResult } from '@/shared/utils/fairLogic';
import CustomSlider from '@/components/DiceSlider';

const DiceResult: FC = () => {
  const { baseInputs } = useGameInputsContext();
  const result = useGameResult(generateDiceResult, baseInputs);

  return (
    <>
      <Box
        width={'100%'}
        height={'150px'}
        borderRadius={'md'}
        bg={'subHeader.bg'}
        display={'flex'}
        alignItems={'center'}
        justifyContent={'center'}
        p={2}>
        <CustomSlider
          value={[result || 50]}
          defaultValue={[50]}
          readOnly={true}
        />
      </Box>
      <BaseInputs />
    </>
  );
};

export default DiceResult;
