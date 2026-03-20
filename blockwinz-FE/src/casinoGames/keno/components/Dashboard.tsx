import BetAmount from '@/components/BetAmount/BetAmount';
import Segment from '@/components/Segment/Segment';
import { Button } from '@/components/ui/button';
import { Box } from '@chakra-ui/react';
import { FunctionComponent, useState } from 'react';
import { GameMode } from '@/shared/enums/gameMode.enum';
import { useKenoGameContext } from '../context/KenoGameContext';
import RiskLevelCard from '@/components/RiskLevelCard/RiskLevelCard';
import { RiskLevel } from '../api/types';
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
    betAmount,
    betAmountErrors,
    setBetAmount,
    isAutoBetting,
    setRiskDropdownValue,
    riskDropdownValue,
    controlsDisabled,
    isBetting,
    typeOfPlay,
    handleBetOnClick,
    isBetButtonDisabled,
    clearNumbers,
    handleAutoPick,
  } = useKenoGameContext();
  const { selectedBalance } = useWalletState();
  const ROUNDING_DECIMALS =
    selectedBalance.decimals || DEFAULT_ROUNDING_DECIMALS;

  const risks = [
    { value: RiskLevel.CLASSIC, title: 'Classic' },
    { value: RiskLevel.LOW, title: 'Low' },
    { value: RiskLevel.MEDIUM, title: 'Medium' },
    { value: RiskLevel.HIGH, title: 'High' },
  ];

  const handleBetClick = () => {
    if (typeOfPlay === GameMode.Manual) {
      handleBetOnClick();
    } else {
      if (isAutoBetting) {
        /* empty */
      } else {
        /* empty */
      }
    }
  };

  const renderBetButton = () => {
    return (
      <BetButton
        disabled={isBetButtonDisabled}
        loading={isBetting}
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
        <Box mb={'24px'} display={{ base: 'block', md: 'none' }}>
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
            disabled={isBetting}
            value={parseFloat(betAmount.toFixed(ROUNDING_DECIMALS))}
            onChange={e => setBetAmount(e)}
            error={betAmountErrors.betAmount}
          />
        </Box>

        <Box>
          <Box mt={'24px'}>
            <RiskLevelCard
              risks={risks}
              value={riskDropdownValue}
              onChange={(value: string) =>
                setRiskDropdownValue(value as RiskLevel)
              }
              disabled={controlsDisabled}
              defaultValue={risks[0].value}
            />
          </Box>
        </Box>

        <Box
          mt={'26px'}
          display={'flex'}
          justifyContent={'space-between'}
          w={'100%'}
          alignItems={'center'}
          gap={'16px'}>
          <Box w={'100%'}>
            <Button
              disabled={controlsDisabled}
              onClick={handleAutoPick}
              w={'100%'}
              h={'54px'}
              bg={'#545463'}
              color={'#ECF0F1'}
              borderRadius={'8px'}>
              Auto Pick
            </Button>
          </Box>
          <Box w={'100%'}>
            <Button
              disabled={controlsDisabled}
              onClick={clearNumbers}
              w={'100%'}
              h={'54px'}
              bg={'#545463'}
              color={'#ECF0F1'}
              borderRadius={'8px'}>
              Clear Table
            </Button>
          </Box>
        </Box>

        <Box
          mt={{ base: '38px', md: '24px' }}
          mb={{ base: '38px', md: '0px' }}
          display={{ base: 'none', md: 'block' }}>
          {renderBetButton()}
        </Box>
      </Box>
    </>
  );
};

export default Dashboard;
