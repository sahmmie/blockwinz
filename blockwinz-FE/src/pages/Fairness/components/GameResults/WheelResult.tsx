import { FC, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import BaseInputs from '../BaseInputs';
import { Box } from '@chakra-ui/react';
import CustomSlider from '@/components/CustomSlider/CustomSlider';
import useGameResult from '../../hooks/useGameResult';
import { generateWheelResult } from '@/shared/utils/fairLogic';
import { useGameInputsContext } from '../../hooks/useGameInputsContext';
import RiskLevelCard from '@/components/RiskLevelCard/RiskLevelCard';
import WheelBuckets from '../Buckets/Buckets';
import { MulData } from '@/casinoGames/wheel/types';
import { wheelMuls } from '@/casinoGames/wheel/wheelMuls';
import {
  parseFairnessUrlSearch,
  patchFairnessUrlParams,
  PF_KEYS,
  type FairnessRisk,
} from '../../fairnessUrlParams';

const WheelResult: FC = () => {
  const { baseInputs } = useGameInputsContext();
  const [searchParams, setSearchParams] = useSearchParams();
  const parsed = useMemo(
    () => parseFairnessUrlSearch(searchParams),
    [searchParams],
  );

  type RiskType = FairnessRisk;
  const [segments, setSegments] = useState(10);
  const [risk, setRisk] = useState<RiskType>('LOW');

  useEffect(() => {
    if (parsed.segments != null) setSegments(parsed.segments);
    if (parsed.risk != null) setRisk(parsed.risk);
  }, [parsed.segments, parsed.risk]);

  const result = useGameResult(generateWheelResult, {
    ...baseInputs,
    segments,
    risk,
  });

  const WHEEL_OPTIONS = [
    { value: 'LOW', title: 'Low' },
    { value: 'MEDIUM', title: 'Medium' },
    { value: 'HIGH', title: 'High' },
  ];

  const [mulData, setMulData] = useState<MulData[]>([]);
  const mulsDataRef = useRef<MulData[]>([]);
  const [prevResults, setPrevResults] = useState<MulData[]>([]);

  useEffect(() => {
    const currentMuls = wheelMuls[risk][segments];
    const uniqueMultipliers = Array.from(new Set(currentMuls.muls));

    const mulData: MulData[] = uniqueMultipliers.sort().map((um, index) => {
      const color = currentMuls.colors.find(c => c.mul === um)?.color || 'gray';
      const count = currentMuls.muls.filter(m => m === um).length;
      const chance = (count / segments) * 100;
      return {
        mul: um,
        color,
        chance,
        index,
        sound: 'sound-path',
        uid: Math.random().toString(),
      };
    });

    mulsDataRef.current = mulData;
    setMulData(mulData);
  }, [segments, risk]);

  useEffect(() => {
    setPrevResults([...mulsDataRef.current.filter(mul => mul.mul === result)]);
  }, [result]);

  return (
    <>
      <Box width='100%' justifyContent={'center'} display={'flex'}>
        {/* here should be the rendercomponent with buckets underneath */}
        <WheelBuckets mulData={mulData} prevResults={prevResults} />
      </Box>
      <BaseInputs />
      <Box pt={4}>
        <RiskLevelCard
          risks={WHEEL_OPTIONS}
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
          defaultValue={WHEEL_OPTIONS[0].value}
        />
      </Box>
      <Box width='100%' py={4}>
        <CustomSlider
          label='Segments'
          min={10}
          max={50}
          step={10}
          value={segments}
          onChange={val => {
            setSegments(val);
            setSearchParams(
              prev =>
                patchFairnessUrlParams(prev, { [PF_KEYS.SEGMENTS]: val }),
              { replace: true },
            );
          }}
        />
      </Box>
    </>
  );
};

export default WheelResult;
