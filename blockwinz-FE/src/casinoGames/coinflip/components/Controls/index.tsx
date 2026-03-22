import { Box } from '@chakra-ui/react';
import React from 'react';
import CoinTypeToggle from '../CoinTypeToggle/CoinTypeToggle';
import { useGameControlsContext } from '../../hooks/gameControlsContext';
import BetAmount from '@/components/BetAmount/BetAmount';
import Dropdown from '@/components/Dropdown/Dropdown';
import BetButton from '@/components/BetButton/BetButton';
import { presetOptions } from '../../types';
import ProfitOnWin from '@/components/ProfitOnWin/ProfitOnWin';
import useWalletState from '@/hooks/useWalletState';
import { DEFAULT_ROUNDING_DECIMALS } from '@/shared/constants/app.constant';

const BetPanel: React.FC = () => {
  const {
    coins,
    min,
    coinType,
    handleCoinsChange,
    handleMinChange,
    handleCoinTypeChange,
    isPlacingBet,
    betAmount,
    profitOnWin,
    handleBetAmountChange,
    handleBet,
    betAmountErrors,
    profitAmountErrors,
    maxProfitErrors,
    coinsOptions,
    minOptions,
    selectedPresetValue,
    handlePresetChange,
  } = useGameControlsContext();

  const { selectedBalance } = useWalletState();
  const ROUNDING_DECIMALS =
    selectedBalance?.decimals || DEFAULT_ROUNDING_DECIMALS;

  const isBetDisabled =
    !!betAmountErrors?.betAmount ||
    !!maxProfitErrors?.betAmount ||
    !!profitAmountErrors?.profit ||
    Number.isNaN(parseFloat(betAmount)) ||
    isPlacingBet;

  const renderBetButton = () => (
    <BetButton
      disabled={isBetDisabled}
      loading={isPlacingBet}
      onClick={handleBet}
    />
  );

  const handlePresetDropdownChange = (e: { target: { value: string } }) => {
    handlePresetChange(e.target.value);
  };
  const handleCoinsDropdownChange = (e: { target: { value: string } }) => {
    const value = e.target.value;
    if (value !== '') handleCoinsChange(Number(value));
  };
  const handleMinDropdownChange = (e: { target: { value: string } }) => {
    const value = e.target.value;
    if (value !== '') handleMinChange(Number(value));
  };

  return (
    <Box
      pt={{ base: '0px', md: '26px' }}
      pl={'16px'}
      pr={'20px'}
      pb={{ base: '38px', md: '0' }}>
      <Box mt={'24px'} mb={'24px'} display={{ base: 'block', md: 'none' }}>
        {renderBetButton()}
      </Box>
      <Box>
        <BetAmount
          disabled={isPlacingBet}
          value={parseFloat(betAmount)}
          onChange={(val) => handleBetAmountChange(val.toString())}
          error={
            betAmountErrors?.betAmount || maxProfitErrors?.betAmount
          }
        />
      </Box>
      <Box mt={'24px'}>
        <ProfitOnWin
          value={parseFloat(profitOnWin).toFixed(ROUNDING_DECIMALS)}
          error={profitAmountErrors?.profit}
        />
      </Box>
      <Box mt={'24px'} display='flex' flexDirection='column' gap='24px'>
        <Dropdown
          label='Presets'
          placeholder='Custom'
          options={presetOptions}
          keyName='value'
          labelName='label'
          selected={selectedPresetValue}
          handleChange={handlePresetDropdownChange}
        />
        <Box
          display='flex'
          justifyContent='space-between'
          width='100%'
          gap='16px'>
          <Dropdown
            label='Coin Amount'
            placeholder='Select coins'
            options={coinsOptions}
            keyName='value'
            labelName='label'
            selected={coins.toString()}
            handleChange={handleCoinsDropdownChange}
          />
          <Dropdown
            label='Min Heads/Tails'
            placeholder='Select min'
            options={minOptions}
            keyName='value'
            labelName='label'
            selected={min.toString()}
            handleChange={handleMinDropdownChange}
          />
        </Box>
        <CoinTypeToggle
          selectedCoinType={coinType}
          onChange={handleCoinTypeChange}
          isDisabled={isPlacingBet}
        />
      </Box>
      <Box
        mt={'38px'}
        mb={{ base: '38px', md: '0px' }}
        display={{ base: 'none', md: 'block' }}>
        {renderBetButton()}
      </Box>
    </Box>
  );
};

export default BetPanel;
