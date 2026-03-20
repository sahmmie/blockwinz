import { Box, useBreakpointValue } from '@chakra-ui/react';
import React from 'react';
import { AutoControls } from './AutoControls';
import CustomSlider from '@/components/CustomSlider/CustomSlider';
import { useGameControlsContext } from '../../hooks/gameControlsContext';
import { GameMode } from '@blockwinz/shared';
import BetAmount from '@/components/BetAmount/BetAmount';
import RiskLevelCard from '@/components/RiskLevelCard/RiskLevelCard';
import { PLINKO_OPTIONS } from '../../clrs';
import BetButton from '@/components/BetButton/BetButton';

const BetPanel: React.FC = () => {
  const isMobile = useBreakpointValue({ base: true, lg: false, md: false });

  const {
    risk,
    toggleRisk,
    rows,
    handleRowsChange,
    isLoading,
    runningBalls,
    mode,
    betAmount,
    handleBetAmountChange,
    handleBet,
    isAutoBetting,
    startAutoBet,
    stopAutoBet,
    betAmountErrors,
    maxProfitErrors,
    gameDataLoading,
  } = useGameControlsContext();

  const handleAutoBetToggle = () => {
    if (isAutoBetting) stopAutoBet();
    else startAutoBet();
  };

  const disableBtn =
    !!betAmountErrors?.betAmount ||
    !!maxProfitErrors?.betAmount ||
    gameDataLoading;

  const renderBetButton = () => {
    return (
      <BetButton
        disabled={disableBtn}
        loading={isLoading || gameDataLoading}
        onClick={mode === 'auto' ? handleAutoBetToggle : handleBet}
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
      <Box>
        <BetAmount
          disabled={mode === GameMode.Manual ? runningBalls : isLoading}
          value={parseFloat(betAmount)}
          onChange={e => handleBetAmountChange(e.toString())}
          error={betAmountErrors.betAmount}
        />
      </Box>
      <Box>
        <RiskLevelCard
          risks={PLINKO_OPTIONS}
          value={risk}
          onChange={(value: string) => toggleRisk(value)}
          disabled={runningBalls}
          defaultValue={PLINKO_OPTIONS[0].value}
        />
      </Box>
      <CustomSlider
        label='Rows'
        isDisabled={runningBalls}
        value={rows}
        onChange={val => handleRowsChange(val)}
      />
      {mode === 'auto' && <AutoControls />}
      {!isMobile && renderBetButton()}
    </Box>
  );
};

export default BetPanel;
