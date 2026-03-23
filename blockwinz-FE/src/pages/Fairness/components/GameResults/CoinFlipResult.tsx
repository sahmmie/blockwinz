import { FC, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Box, Image, Tag, TagLabel, Text } from '@chakra-ui/react';
import BaseInputs from '../BaseInputs';
import useGameResult from '../../hooks/useGameResult';
import { useGameInputsContext } from '../../hooks/useGameInputsContext';
import {
  parseFairnessUrlSearch,
  patchFairnessUrlParams,
  PF_KEYS,
} from '../../fairnessUrlParams';
import {
  verifyCoinFlipRound,
  type CoinFlipVerifyResult,
} from '@/shared/utils/fairLogic';
import type { GenerateFairLogicResultCoinFlipDto } from '@/shared/types/core';
import Dropdown from '@/components/Dropdown/Dropdown';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/useIsMobile';
import { findPreset, presetOptions, presets } from '@/casinoGames/coinflip/types';
import goldImg from '@/casinoGames/coinflip/assets/gold.png';
import silverImg from '@/casinoGames/coinflip/assets/silver.png';
import { CoinFlipOutcomeGameCanvas } from '@/casinoGames/coinflip/components/Renderer/CoinFlipOutcomeGameCanvas';

function clampMinForCoins(coins: number, min: number): number {
  let m = Math.max(1, Math.min(coins, Math.floor(min) || 1));
  if (coins >= 6 && coins <= 8 && m < 2) m = 2;
  if (coins >= 9 && coins <= 10 && m < 3) m = 3;
  return m;
}

function buildMinOptions(coins: number): { value: number; label: string }[] {
  let start = 1;
  if (coins >= 9) start = 3;
  else if (coins >= 6) start = 2;
  return Array.from({ length: coins - start + 1 }, (_, i) => ({
    value: i + start,
    label: `x${i + start}`,
  }));
}

const goldBorder = '#ffce1d';
const silverBorder = '#d4d4d4';

function CoinFlipOutcomeVisual({ result }: { result: CoinFlipVerifyResult }) {
  const mulTagBg = result.isWin ? '#00DD25' : '#2d3148';
  const mulLabelColor = result.isWin ? 'white' : '#CBCCD1';

  return (
    <Box
      width='100%'
      display='flex'
      flexDirection='column'
      alignItems='center'
      gap={1}>
      <Box display='flex' justifyContent='center' w='100%'>
        <Tag.Root
          bgColor={mulTagBg}
          size='xl'
          borderRadius='md'
          minW='5rem'
          justifyContent='center'>
          <TagLabel
            color={mulLabelColor}
            fontWeight={700}
            fontSize='1.2rem'
            py={1}
            textWrap='nowrap'
            whiteSpace='nowrap'
            overflow='hidden'>
            {result.multiplier.toFixed(2)}×
          </TagLabel>
        </Tag.Root>
      </Box>

      <Box w='100%' px={{ base: 0, md: 2 }}>
        <CoinFlipOutcomeGameCanvas
          coins={result.coins}
          min={result.min}
          coinType={result.coinType}
          verified
          results={result.results}
          multiplier={result.multiplier}
          isWin={result.isWin}
        />
      </Box>
    </Box>
  );
}

const CoinFlipResult: FC = () => {
  const { baseInputs } = useGameInputsContext();
  const isMobile = useIsMobile();
  const coinImgW = isMobile ? '56px' : '72px';
  const [searchParams, setSearchParams] = useSearchParams();
  const parsed = useMemo(
    () => parseFairnessUrlSearch(searchParams),
    [searchParams],
  );

  const [coins, setCoins] = useState(presets[0].coins);
  const [min, setMin] = useState(presets[0].min);
  const [coinType, setCoinType] = useState(1);

  const coinsOptions = useMemo(
    () =>
      Array.from({ length: 10 }, (_, i) => ({
        value: i + 1,
        label: `x${i + 1}`,
      })),
    [],
  );

  const minOptions = useMemo(() => buildMinOptions(coins), [coins]);

  const selectedPresetValue = useMemo(() => {
    const match = findPreset(coins, min);
    return match ? `${match.coins}:${match.min}` : null;
  }, [coins, min]);

  useEffect(() => {
    if (parsed.coinflipCoins != null) {
      setCoins(Math.max(1, Math.min(10, parsed.coinflipCoins)));
    }
    if (parsed.coinflipMin != null) {
      setMin(parsed.coinflipMin);
    }
    if (parsed.coinflipSide === 0 || parsed.coinflipSide === 1) {
      setCoinType(parsed.coinflipSide);
    }
  }, [parsed.coinflipCoins, parsed.coinflipMin, parsed.coinflipSide]);

  useEffect(() => {
    setMin(prev => clampMinForCoins(coins, prev));
  }, [coins]);

  const inputs: GenerateFairLogicResultCoinFlipDto = useMemo(
    () => ({
      ...baseInputs,
      coins,
      min: clampMinForCoins(coins, min),
      coinType,
    }),
    [baseInputs, coins, min, coinType],
  );

  const result = useGameResult(verifyCoinFlipRound, inputs);

  const effectiveMin = clampMinForCoins(coins, min);

  const patchCoinflipParams = (patch: {
    coins?: number;
    min?: number;
    side?: number;
  }) => {
    setSearchParams(
      prev =>
        patchFairnessUrlParams(prev, {
          ...(patch.coins != null ? { [PF_KEYS.COINS]: patch.coins } : {}),
          ...(patch.min != null ? { [PF_KEYS.COIN_MIN]: patch.min } : {}),
          ...(patch.side != null ? { [PF_KEYS.SIDE]: patch.side } : {}),
        }),
      { replace: true },
    );
  };

  return (
    <>
      <Box
        width='100%'
        justifyContent='center'
        display='flex'
        border='.1px solid #4A445A99'
        borderRadius='8px'
        pt={8}
        pb={0}>
        {result ? (
          <CoinFlipOutcomeVisual result={result} />
        ) : (
          <Box
            w='100%'
            display='flex'
            flexDirection='column'
            alignItems='center'
            gap={1}>
            <Box w='100%' px={{ base: 0, md: 2 }}>
              <CoinFlipOutcomeGameCanvas
                coins={coins}
                min={effectiveMin}
                coinType={coinType}
                verified={false}
              />
            </Box>
          </Box>
        )}
      </Box>

      <BaseInputs />

      <Box mt={4} width='100%'>
        <Dropdown
          label='Presets'
          placeholder='Custom'
          options={presetOptions}
          keyName='value'
          labelName='label'
          selected={selectedPresetValue}
          handleChange={e => {
            const value = e.target.value;
            if (value === '') return;
            const [c, m] = value.split(':').map(Number);
            const preset = findPreset(c, m);
            if (!preset) return;
            setCoins(preset.coins);
            setMin(preset.min);
            patchCoinflipParams({ coins: preset.coins, min: preset.min });
          }}
        />
      </Box>

      <Box
        display='flex'
        flexDirection={{ base: 'column', sm: 'row' }}
        gap='16px'
        mt={4}
        width='100%'>
        <Box flex={1}>
          <Dropdown
            label='Coin Amount'
            placeholder='Select coins'
            options={coinsOptions}
            keyName='value'
            labelName='label'
            selected={coins.toString()}
            handleChange={e => {
              const v = Number(e.target.value);
              if (e.target.value === '') return;
              setCoins(v);
              patchCoinflipParams({ coins: v });
            }}
          />
        </Box>
        <Box flex={1}>
          <Dropdown
            label='Min Heads/Tails'
            placeholder='Select min'
            options={minOptions}
            keyName='value'
            labelName='label'
            selected={clampMinForCoins(coins, min).toString()}
            handleChange={e => {
              const v = clampMinForCoins(coins, Number(e.target.value) || 1);
              if (e.target.value === '') return;
              setMin(v);
              patchCoinflipParams({ min: v });
            }}
          />
        </Box>
      </Box>

      <Box mt={4}>
        <Text fontSize='14px' fontWeight={500} color='#D9D9D9' mb={2}>
          Your side
        </Text>
        <Box display='flex' justifyContent='center' gap='16px' h='64px'>
          <Button
            flex={1}
            h='100%'
            onClick={() => {
              setCoinType(0);
              patchCoinflipParams({ side: 0 });
            }}
            bg='transparent'
            _hover={{ bg: 'button.bg' }}
            borderRadius='md'
            border={coinType === 0 ? '2px solid' : undefined}
            borderColor={coinType === 0 ? goldBorder : 'transparent'}
            boxShadow={coinType === 0 ? '0 0 10px #FFAE0099' : 'none'}
            p={2}>
            <Image
              src={goldImg}
              alt='Gold'
              w={coinImgW}
              maxW={coinImgW}
              pointerEvents='none'
              draggable={false}
            />
          </Button>
          <Button
            flex={1}
            h='100%'
            onClick={() => {
              setCoinType(1);
              patchCoinflipParams({ side: 1 });
            }}
            bg='transparent'
            _hover={{ bg: 'button.bg' }}
            borderRadius='md'
            border={coinType === 1 ? '2px solid' : undefined}
            borderColor={coinType === 1 ? silverBorder : 'transparent'}
            boxShadow={coinType === 1 ? '0 0 10px #C0C0C099' : 'none'}
            p={2}>
            <Image
              src={silverImg}
              alt='Silver'
              w={coinImgW}
              maxW={coinImgW}
              pointerEvents='none'
              draggable={false}
            />
          </Button>
        </Box>
      </Box>
    </>
  );
};

export default CoinFlipResult;
