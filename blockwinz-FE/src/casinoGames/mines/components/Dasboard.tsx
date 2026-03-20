import BetAmount from '@/components/BetAmount/BetAmount';
import Segment from '@/components/Segment/Segment';
import { Box } from '@chakra-ui/react';
import { FunctionComponent } from 'react';
import { GameMode } from '@blockwinz/shared';
import { useGameControls } from '../context/GameControlsContext';
import Dropdown from '@/components/Dropdown/Dropdown';
import { DROPDOWN_OPTIONS } from '../constants';
import ActiveBetControls from './ActiveBetControls';
import BetButton from '@/components/BetButton/BetButton';

interface DashboardProps {}

const Dashboard: FunctionComponent<DashboardProps> = () => {
  const options = [
    { label: 'Manual', value: 'manual' },
    { label: 'Auto', value: 'auto' },
  ];
  const showAutoSegment = false;
  const { state, actions } = useGameControls();

  const {
    betType,
    betAmount,
    betAmountErrors,
    isLoading,
    activeAutoBet,
    minesCount,
    activeBet,
    currency,
  } = state;

  const { handleStartMines, setBetAmount, setBetType, setMinesCount } = actions;

  const handleBetClick = () => {
    if (betType === GameMode.Manual) {
      handleStartMines();
    } else {
      if (activeAutoBet) {
        /* empty */
      } else {
        /* empty */
      }
    }
  };

  const renderBetButton = () => {
    return (
      !activeBet && (
        <BetButton
          disabled={!!betAmountErrors.betAmount || isLoading}
          loading={isLoading}
          onClick={handleBetClick}
        />
      )
    );
  };

  return (
    <>
      <Box
        pt={{ base: '0px', md: '26px' }}
        pl={'16px'}
        pr={'20px'}
        pb={{ base: '38px', md: '0' }}>
        <Box
          mb={'24px'}
          display={{ base: 'block', md: 'none' }}
          mt={{ base: '38px', md: '0' }}>
          {renderBetButton()}
        </Box>
        {showAutoSegment && (
          <Box mb={'24px'}>
            <Segment
              options={options}
              selected={betType}
              setSelected={e => setBetType(e as GameMode)}
            />
          </Box>
        )}
        <Box>
          <BetAmount
            currency={currency}
            disabled={isLoading || activeBet}
            value={betAmount}
            onChange={e => setBetAmount(e)}
            error={betAmountErrors.betAmount}
          />
        </Box>
        {!activeBet && (
          <Box mt={'24px'}>
            <Dropdown
              className='border-none'
              selectTriggerProps={{
                bg: '#000A27',
                borderRadius: '8px',
              }}
              labelName='label'
              keyName='value'
              placeholder='Select number of mines'
              label='Mines'
              options={DROPDOWN_OPTIONS}
              selected={minesCount.toString()}
              handleChange={e =>
                setMinesCount(
                  parseInt((e.target as unknown as { value: string }).value),
                )
              }
            />
          </Box>
        )}
        {activeBet && <ActiveBetControls />}
        <Box mt={'38px'} mb={'38px'} display={{ base: 'none', md: 'block' }}>
          {renderBetButton()}
        </Box>
      </Box>
    </>
  );
};

export default Dashboard;
