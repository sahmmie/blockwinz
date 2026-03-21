import { FunctionComponent, useMemo } from 'react';
import CustomInput from '../CustomInput/CustomInput';
import { Box, Text } from '@chakra-ui/react';
import useWalletState from '@/hooks/useWalletState';
import { Currency, StakeDenomination } from '@blockwinz/shared';
import { WalletCurrencyIcon } from '@/components/WalletCurrencyIcon/WalletCurrencyIcon';
import { DEFAULT_ROUNDING_DECIMALS } from '@/shared/constants/app.constant';

const USD_PROFIT_DECIMALS = 2;

interface ProfitOnWinProps {
  /** Expected profit in native currency (SOL/BWZ); same basis as `getProfitOnWin` */
  value: string;
  error?: string | undefined;
  currency?: Currency;
}

const ProfitOnWin: FunctionComponent<ProfitOnWinProps> = ({
  value,
  error,
  currency,
}) => {
  const { selectedBalance, stakeDenomination, getTokenPrice } = useWalletState();
  const effectiveCurrency = currency ?? selectedBalance?.currency;
  const ROUNDING_DECIMALS =
    selectedBalance?.decimals || DEFAULT_ROUNDING_DECIMALS;
  const solUsd = getTokenPrice('SOL');
  const isUsdStake =
    effectiveCurrency === Currency.SOL &&
    stakeDenomination === StakeDenomination.Usd;

  const profitSol = useMemo(() => {
    const n = parseFloat(value);
    return Number.isFinite(n) ? n : 0;
  }, [value]);

  const inputDisplay = useMemo(() => {
    if (isUsdStake && solUsd > 0) {
      return (profitSol * solUsd).toFixed(USD_PROFIT_DECIMALS);
    }
    return Number.isFinite(parseFloat(value)) ? value : '0.00';
  }, [isUsdStake, solUsd, profitSol, value]);

  /** One line only: complement to the disabled input (USD in field → ≈ SOL; SOL in field → ≈ $). */
  const conversionHint =
    isUsdStake && solUsd > 0
      ? `≈ ${profitSol.toFixed(ROUNDING_DECIMALS)} SOL`
      : effectiveCurrency === Currency.SOL && solUsd > 0
        ? `≈ $${(profitSol * solUsd).toFixed(USD_PROFIT_DECIMALS)}`
        : null;

  const walletCurrency = currency ?? selectedBalance?.currency ?? Currency.SOL;

  const startElement = () => (
    <Box>
      <WalletCurrencyIcon
        currency={walletCurrency}
        usdDenominatedSol={isUsdStake}
      />
    </Box>
  );

  const label = (): JSX.Element => {
    return (
      <>
        <Box
          w={'100%'}
          display={'flex'}
          justifyContent={'space-between'}
          alignItems={'center'}
          color={'#D9D9D9'}
          mb={'2px'}>
          <Box fontSize={'14px'} fontWeight={'500'}>
            <Text>Profit On Win</Text>
          </Box>
          <Box
            fontSize={'14px'}
            fontWeight={'500'}
            mr={'14px'}
            textAlign="right">
            {conversionHint && (
              <Text color="#9ca3af">
                {conversionHint}
              </Text>
            )}
          </Box>
        </Box>
      </>
    );
  };

  return (
    <>
      <CustomInput
        disabled
        type='number'
        value={inputDisplay}
        fieldProps={{ label: label(), errorText: error }}
        inputGroupProps={{
          startElement: startElement(),
        }}
      />
    </>
  );
};

export default ProfitOnWin;
