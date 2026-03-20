import CustomInput from '@/components/CustomInput/CustomInput';
import { currencyIconMap } from '@/shared/utils/gameMaps';
import { FunctionComponent } from 'react';
import DownFilledIcon from 'assets/icons/down-filled-icon.svg';
import { Box, Text } from '@chakra-ui/react';
import { useGameControls } from '../context/GameControlsContext';
import { Button } from '@/components/ui/button';
import { DEFAULT_ROUNDING_DECIMALS } from '@/shared/constants/app.constant';
import useWalletState from '@/hooks/useWalletState';

interface ActiveBetControlsProps {}

const ActiveBetControls: FunctionComponent<ActiveBetControlsProps> = () => {
  const { state, actions } = useGameControls();

  const {
    minesCount,
    gemsCount,
    currency,
    totalProfit,
    multiplier,
    nextWinMultiplier,
    nextTotalProfit,
    betAmount,
    isLoadingReveal,
    isLoadingCashout,
    tiles,
  } = state;

  const { handleRandomPick, handleCashout } = actions;

  const { balances } = useWalletState();

  const ROUNDING_DECIMALS = balances.find(c => c.currency === currency)?.decimals || DEFAULT_ROUNDING_DECIMALS;

  const totalProfitCal = (
    totalProfit > 0 ? totalProfit - betAmount : 0
  ).toFixed(ROUNDING_DECIMALS);
  const nextTotalProfitCal = (
    nextTotalProfit > 0 ? nextTotalProfit - betAmount : 0
  ).toFixed(ROUNDING_DECIMALS);

  const noTileSelected = tiles.every(tile => !tile.isSelected);

  const renderBetDetailsBox = () => {
    return (
      <Box
        mt={'18px'}
        py={'10px'}
        border={'.4px solid #CBCCD1'}
        borderRadius={'8px'}
        w={'100%'}
        bg={'#000A27'}>
        <Box
          fontSize={'14px'}
          fontWeight={'500'}
          lineHeight={'21px'}
          px={'12px'}>
          <Box
            display={'flex'}
            alignItems={'center'}
            justifyContent={'space-between'}
            w={'100%'}>
            <Text>Current profit</Text>
            <Text>
              {totalProfit.toFixed(ROUNDING_DECIMALS)} {currency?.toUpperCase()}
            </Text>
          </Box>
          <Box
            pt={'6px'}
            fontWeight={'600'}
            display={'flex'}
            alignItems={'center'}
            justifyContent={'space-between'}
            w={'100%'}
            color={'#E566FF'}>
            <Box display={'flex'} alignItems={'center'} gap={'4px'}>
              <img
                src={currencyIconMap[currency]}
                alt='Currency Icon'
                style={{ width: '20px', height: '20px' }}
              />
              <Text ml={'4px'}>{totalProfitCal}</Text>
            </Box>
            <Box display={'flex'} alignItems={'center'} gap={'4px'}>
              <Text ml={'4px'}>{multiplier.toFixed(2)}x</Text>
            </Box>
          </Box>
        </Box>

        <Box
          display={'flex'}
          alignItems={'center'}
          justifyContent={'space-between'}
          w={'100%'}
          my={'10px'}>
          <Box border={'.3px solid #FFFFFF'} borderRadius={'8px'} w={'100%'} />
          <Box mx={'4px'}>
            <img
              src={DownFilledIcon}
              alt='Arrow Down Icon'
              style={{ width: '62px' }}
            />
          </Box>
          <Box border={'.3px solid #FFFFFF'} borderRadius={'8px'} w={'100%'} />
        </Box>

        <Box
          px={'12px'}
          fontSize={'14px'}
          fontWeight={'500'}
          lineHeight={'21px'}>
          <Box
            display={'flex'}
            alignItems={'center'}
            justifyContent={'space-between'}
            w={'100%'}>
            <Text
              textWrap={'wrap'}
              textOverflow={'ellipsis'}
              overflow={'hidden'}
              whiteSpace={'nowrap'}>
              Profit on next tile
            </Text>
            <Text>
              {nextTotalProfit.toFixed(ROUNDING_DECIMALS)}{' '}
              {currency?.toUpperCase()}
            </Text>
          </Box>
          <Box
            pt={'6px'}
            fontWeight={'600'}
            display={'flex'}
            alignItems={'center'}
            justifyContent={'space-between'}
            w={'100%'}
            color={'#E566FF'}>
            <Box display={'flex'} alignItems={'center'} gap={'4px'}>
              <img
                src={currencyIconMap[currency]}
                alt='Currency Icon'
                style={{ width: '22px', height: '22px' }}
              />
              <Text ml={'4px'}>{nextTotalProfitCal}</Text>
            </Box>
            <Box display={'flex'} alignItems={'center'} gap={'4px'}>
              <Text ml={'4px'}>{nextWinMultiplier.toFixed(2)}x</Text>
            </Box>
          </Box>
        </Box>
      </Box>
    );
  };

  return (
    <>
      <Box
        pt={'18px'}
        gap={'12px'}
        display={'flex'}
        alignItems={'center'}
        justifyContent={'center'}
        w={'100%'}>
        <Box w={'100%'}>
          <CustomInput
            disabled={true}
            w={'100%'}
            value={minesCount}
            type='text'
            fieldProps={{
              label: 'Mines',
            }}
          />
        </Box>
        <Box w={'100%'}>
          <CustomInput
            disabled={true}
            w={'100%'}
            value={gemsCount}
            type='text'
            fieldProps={{
              label: 'Gems',
            }}
          />
        </Box>
      </Box>
      {renderBetDetailsBox()}
      <Box mt={'24px'}>
        <Button
          loading={isLoadingCashout}
          disabled={noTileSelected}
          onClick={handleCashout}
          w={'100%'}
          bg={'#00DD25'}
          py={'24px'}
          _disabled={{ bg: '#545463', color: '#ECF0F1' }}>
          Cashout
          <img
            src={currencyIconMap[currency]}
            alt='Currency Icon'
            style={{ width: '22px', height: '22px', marginLeft: '8px' }}
          />
          {totalProfit.toFixed(ROUNDING_DECIMALS)}
        </Button>
      </Box>
      <Box mt={{ base: '24px', md: '16px' }} mb={{ base: '38px', md: '0px' }}>
        <Button
          disabled={isLoadingReveal}
          loading={isLoadingReveal}
          onClick={handleRandomPick}
          variant={'outline'}
          bg={'#000A27'}
          w={'100%'}
          border={'.1px solid #CBCCD1'}
          py={'24px'}>
          Pick Random Tile
        </Button>
      </Box>
    </>
  );
};

export default ActiveBetControls;
