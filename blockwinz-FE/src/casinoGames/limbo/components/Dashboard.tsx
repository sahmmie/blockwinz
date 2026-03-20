import BetAmount from '@/components/BetAmount/BetAmount';
import ProfitOnWin from '@/components/ProfitOnWin/ProfitOnWin';
import Segment from '@/components/Segment/Segment';
import { Box } from '@chakra-ui/react';
import { FunctionComponent, useState } from 'react';
import { GameMode } from '@/shared/enums/gameMode.enum';
import { useLimboGameContext } from '../context/LimboGameContext';
import useWalletState from '@/hooks/useWalletState';
import { DEFAULT_ROUNDING_DECIMALS } from '@/shared/constants/app.constant';
import BetButton from '@/components/BetButton/BetButton';

interface DashboardProps {}

const Dashboard: FunctionComponent<DashboardProps> = () => {
  const options = [
    { label: 'Manual', value: 'manual' },
    { label: 'Auto', value: 'auto' },
  ];
  const [selected, setSelected] = useState(options[0].value);
  const showAutoSegment = false;
  const {
    mode,
    betAmount,
    betAmountErrors,
    isPlacingBet,
    isLoading,
    handleBetAmountChange,
    profitOnWin,
    profitAmountErrors,
    startAutoBet,
    stopAutoBet,
    isBetDisabled,
    handleBet,
    isAutoBetting,
  } = useLimboGameContext();
  const { selectedBalance } = useWalletState();
  const ROUNDING_DECIMALS =
    selectedBalance.decimals || DEFAULT_ROUNDING_DECIMALS;

  const handleBetClick = () => {
    if (mode === GameMode.Manual) {
      handleBet();
    } else {
      if (isAutoBetting) {
        stopAutoBet();
      } else {
        startAutoBet();
      }
    }
  };

  const renderBetButton = () => {
    return (
      <BetButton
        disabled={isBetDisabled || isPlacingBet}
        loading={isPlacingBet}
        onClick={handleBetClick}
      />
    );
  };

  return (
    <>
      <Box
        pt={{ base: '0px', md: '26px' }}
        pl={'16px'}
        pr={'20px'}
        pb={{ base: '38px', md: '0' }}>
        <Box mt={'24px'} mb={'24px'} display={{ base: 'block', md: 'none' }}>
          {renderBetButton()}
        </Box>
        {showAutoSegment && (
          <Box mb={'24px'}>
            <Segment
              options={options}
              selected={selected}
              setSelected={setSelected}
            />
          </Box>
        )}
        <Box>
          <BetAmount
            disabled={mode === GameMode.Manual ? isPlacingBet : isLoading}
            value={parseFloat(betAmount)}
            onChange={e => handleBetAmountChange(e.toString())}
            error={betAmountErrors.betAmount}
          />
        </Box>
        <Box mt={'24px'}>
          <ProfitOnWin
            value={parseFloat(profitOnWin).toFixed(ROUNDING_DECIMALS)}
            error={profitAmountErrors.profit}
          />
        </Box>

        <Box
          mt={'38px'}
          mb={{ base: '38px', md: '0px' }}
          display={{ base: 'none', md: 'block' }}>
          {renderBetButton()}
        </Box>
      </Box>
    </>
  );
};

export default Dashboard;
