import { FC, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import BaseInputs from '../BaseInputs';
import { Box, Tag, TagLabel } from '@chakra-ui/react';
import useGameResult from '../../hooks/useGameResult';
import { useGameInputsContext } from '../../hooks/useGameInputsContext';
import { generatePlinkoResult } from '@/shared/utils/fairLogic';
import { plinkoMuls } from '@/casinoGames/plinko/plinkoMuls';
import RiskLevelCard from '@/components/RiskLevelCard/RiskLevelCard';
import PlinkoSlider from '@/components/CustomSlider/CustomSlider';
import { colors, PLINKO_OPTIONS } from '@/casinoGames/plinko/clrs';
import {
  parseFairnessUrlSearch,
  patchFairnessUrlParams,
  PF_KEYS,
  type FairnessRisk,
} from '../../fairnessUrlParams';

const PlinkoResult: FC = () => {
  const { baseInputs } = useGameInputsContext();
  const [searchParams, setSearchParams] = useSearchParams();
  const parsed = useMemo(
    () => parseFairnessUrlSearch(searchParams),
    [searchParams],
  );

  type RiskType = FairnessRisk;
  const [rows, setRows] = useState(8);
  const [risk, setRisk] = useState<RiskType>('LOW');

  useEffect(() => {
    if (parsed.rows != null) setRows(parsed.rows);
    if (parsed.risk != null) setRisk(parsed.risk);
  }, [parsed.rows, parsed.risk]);

  const result = useGameResult(generatePlinkoResult, {
    ...baseInputs,
    rows,
    risk,
  });
  
  const numBuckets = plinkoMuls[risk][rows].length;
  const middleIndex = Math.floor(numBuckets / 2);
  const resultIndex = plinkoMuls[risk][rows].indexOf(result || 0);
  const distanceFromMiddle = Math.abs(middleIndex - resultIndex);
  const colorIndexIncrement = (colors.length - 1) / middleIndex;
  const colorIndex = Math.round(colorIndexIncrement * distanceFromMiddle);

  const bgColor = colors[colorIndex] || 'gray';

  return (
    <>
      <Box width='100%' justifyContent={'center'} display={'flex'} border={'.1px solid #4A445A99'} borderRadius={'8px'} py={8}>
        <Tag.Root
          bgColor={bgColor}
          size='xl'
          borderRadius='md'
          minW={'5rem'}
          justifyContent={'center'}>
          <TagLabel color={'white'} fontWeight={'700'} fontSize={'1.2rem'} py={2} textWrap={'nowrap'} whiteSpace={'nowrap'} overflow={'hidden'}>
            {result || 0}
          </TagLabel>
        </Tag.Root>
      </Box>
      <BaseInputs />
      <Box pt={4}>
      <RiskLevelCard
        risks={PLINKO_OPTIONS}
        value={risk}
        onChange={(value: string) => {
          const next = value as RiskType;
          setRisk(next);
          setSearchParams(
            prev =>
              patchFairnessUrlParams(prev, { [PF_KEYS.RISK]: next }),
            { replace: true },
          );
        }}
        defaultValue={PLINKO_OPTIONS[0].value}
      />
      </Box>
      <Box width='100%' pb={4} pt={4}>
        <PlinkoSlider
          label='Rows'
          value={rows}
          onChange={val => {
            setRows(val);
            setSearchParams(
              prev =>
                patchFairnessUrlParams(prev, { [PF_KEYS.ROWS]: val }),
              { replace: true },
            );
          }}
          trackBg='#151832'
        />
      </Box>
    </>
  );
};

export default PlinkoResult;
