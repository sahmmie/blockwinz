import BetAmount from '@/components/BetAmount/BetAmount';
import ProfitOnWin from '@/components/ProfitOnWin/ProfitOnWin';
import Segment from '@/components/Segment/Segment';
import { Box } from '@chakra-ui/react';
import { FunctionComponent, useState } from 'react';
import { GameMode } from '@/shared/enums/gameMode.enum';
import { useTictactoeGameContext } from '../context/TictactoeGameContext';
import RiskLevelCard from '@/components/RiskLevelCard/RiskLevelCard';
import { RiskLevel } from '../types';
import { DEFAULT_ROUNDING_DECIMALS } from '@/shared/constants/app.constant';
import useWalletState from '@/hooks/useWalletState';
import BetButton from '@/components/BetButton/BetButton';

interface DashboardProps {}

const Dashboard: FunctionComponent<DashboardProps> = () => {
  const options = [
    { label: 'Manual', value: 'manual' },
    { label: 'Auto', value: 'auto' },
  ];
  const [selected, setSelected] = useState(options[0].value);
  const { state, actions } = useTictactoeGameContext();

  const {
    betAmount,
    betAmountErrors,
    isLoading,
    profitOnWin,
    mode,
    isActiveGame,
    hasEnded,
    multiplier,
    isAnimating,
    isLoadingStart,
    currency,
  } = state;
  const { balances } = useWalletState();

  const ROUNDING_DECIMALS =
    balances.find(c => c.currency === currency)?.decimals ||
    DEFAULT_ROUNDING_DECIMALS;

  const { handleOnBet, handleBetAmountChange, setMultiplier } = actions;

  const risks = [
    { value: RiskLevel.LOW, title: 'Low' },
    { value: RiskLevel.MEDIUM, title: 'Medium' },
    { value: RiskLevel.HIGH, title: 'High' },
  ];

  const handleBetClick = () => {
    if (mode === GameMode.Manual) {
      handleOnBet();
    } else {
      //  TODO: Implement auto bet
    }
  };

  const showBetButton = !isActiveGame() || hasEnded();

  const showAutoSegment = false;

  const renderBetButton = () => {
    return (
      showBetButton && (
        <BetButton
          disabled={isLoading || !!betAmountErrors.betAmount}
          loading={isLoading || isAnimating || isLoadingStart}
          onClick={handleBetClick}
        />
      )
    );
  };

  return (
    <>
      <Box pt={{ base: '0px', md: '26px' }} pl={'16px'} pr={'20px'}>
        <Box mt={'26px'} mb={'24px'} display={{ base: 'block', md: 'none' }}>
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
            currency={currency}
            disabled={isLoading || !showBetButton}
            value={parseFloat(betAmount.toFixed(ROUNDING_DECIMALS))}
            onChange={e => handleBetAmountChange(e)}
            error={betAmountErrors.betAmount}
          />
        </Box>
        <Box mt={'24px'}>
          <ProfitOnWin
            value={profitOnWin.toFixed(ROUNDING_DECIMALS)}
            currency={currency}
          />
        </Box>

        <Box mt={'24px'}>
          <RiskLevelCard
            risks={risks}
            value={multiplier}
            onChange={e => setMultiplier(e as RiskLevel)}
            disabled={isLoading || !showBetButton}
            defaultValue={risks[0].value}
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
