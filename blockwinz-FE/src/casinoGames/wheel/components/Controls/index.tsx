import { Box, useBreakpointValue } from '@chakra-ui/react';
import React from 'react';
import { AutoControls } from './AutoControls';
import { useGameControlsContext } from '../../hooks/gameControlsContext';
import BetAmount from '@/components/BetAmount/BetAmount';
import RiskLevelCard from '@/components/RiskLevelCard/RiskLevelCard';
import BetButton from '@/components/BetButton/BetButton';
import CustomSlider from '@/components/CustomSlider/CustomSlider';

const WHEEL_OPTIONS = [
  { value: 'LOW', title: 'Low' },
  { value: 'MEDIUM', title: 'Medium' },
  { value: 'HIGH', title: 'High' },
];

const BetPanel: React.FC = () => {
  const isMobile = useBreakpointValue({ base: true, lg: false, md: false });

  const {
    risk,
    toggleRisk,
    segments,
    handleSegmentsChange,
    isLoading,
    isSpinning,
    mode,
    betAmount,
    handleBetAmountChange,
    handleBet,
    isAutoBetting,
    startAutoBet,
    stopAutoBet,
    betAmountErrors,
    maxProfitErrors,
  } = useGameControlsContext();

  const handleAutoBetToggle = () => {
    if (isAutoBetting) stopAutoBet();
    else startAutoBet();
  };

  const disableBtn =
    !!betAmountErrors?.betAmount ||
    !!maxProfitErrors?.betAmount ||
    (!isAutoBetting && isSpinning);

  const renderBetButton = () => {
    return (
      <BetButton
        disabled={disableBtn}
        onClick={mode === 'auto' ? handleAutoBetToggle : handleBet}
        loading={isLoading}
      />
    );
  };

  return (
    <Box
      p={1}
      display='flex'
      flexDirection={'column'}
      gap={'24px'}
      pt={{ base: '0px', md: '26px' }}
      pl={'16px'}
      pr={'20px'}
      pb={{ base: '38px', md: '0' }}>
      {isMobile && renderBetButton()}
      <BetAmount
        disabled={isSpinning}
        value={parseFloat(betAmount)}
        onChange={e => handleBetAmountChange(e.toString())}
        error={betAmountErrors?.betAmount || maxProfitErrors?.betAmount}
      />
      <RiskLevelCard
        risks={WHEEL_OPTIONS}
        value={risk}
        onChange={(value: string) => toggleRisk(value)}
        disabled={isSpinning}
        defaultValue={WHEEL_OPTIONS[0].value}
      />
      <CustomSlider
        label='Segments'
        min={10}
        max={50}
        step={10}
        isDisabled={isSpinning}
        value={segments}
        onChange={val => handleSegmentsChange(val)}
      />
      {mode === 'auto' && <AutoControls />}
      {!isMobile && renderBetButton()}
    </Box>
  );
};

export default BetPanel;
