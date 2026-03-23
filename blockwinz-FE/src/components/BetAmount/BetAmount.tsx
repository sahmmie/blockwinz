import useWalletState from '@/hooks/useWalletState';
import { getCurrencyMax, parseFloatValue } from '@/shared/utils/common';
import { Box, Text } from '@chakra-ui/react';
import { FunctionComponent, useEffect, useState } from 'react';
import CustomInput from '../CustomInput/CustomInput';
import { Button } from '../ui/button';
import { Currency, StakeDenomination } from '@blockwinz/shared';
import { DEFAULT_ROUNDING_DECIMALS } from '@/shared/constants/app.constant';
import { WalletCurrencyIcon } from '@/components/WalletCurrencyIcon/WalletCurrencyIcon';

const USD_INPUT_DECIMALS = 2;

interface BetAmountProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  error?: string | undefined;
  currency?: Currency;
}

const BetAmount: FunctionComponent<BetAmountProps> = ({
  value,
  onChange,
  disabled,
  error,
  currency,
}) => {
  const {
    selectedBalance,
    stakeDenomination,
    setStakeDenomination,
    setSolStakeUsdInput,
    solStakeUsdInput,
    getTokenPrice,
  } = useWalletState();
  const ROUNDING_DECIMALS =
    selectedBalance?.decimals || DEFAULT_ROUNDING_DECIMALS;
  const effectiveCurrency = currency ?? selectedBalance?.currency;
  const solUsd = getTokenPrice('SOL');
  const isUsdStake =
    effectiveCurrency === Currency.SOL &&
    stakeDenomination === StakeDenomination.Usd;
  const walletCurrency = currency ?? selectedBalance?.currency ?? Currency.SOL;

  const maxSol = Math.min(
    selectedBalance?.availableBalance || 0,
    getCurrencyMax(selectedBalance?.currency as Currency, 'bet'),
  );
  const maxUsd = solUsd > 0 ? maxSol * solUsd : 0;

  const clampToMaxSol = (sol: number) => Math.min(sol, maxSol);
  const clampToMaxUsd = (usd: number) =>
    Math.min(usd, maxUsd || usd);

  const [inputValue, setInputValue] = useState<string>(() =>
    value.toFixed(ROUNDING_DECIMALS),
  );

  // Keep zustand `solStakeUsdInput` in sync with SOL stake × price (fixes persisted USD mode
  // after refresh / prices loading after mount — previously only local input updated).
  useEffect(() => {
    if (isUsdStake && solUsd > 0) {
      const usd = clampToMaxUsd(value * solUsd);
      setInputValue(usd.toFixed(USD_INPUT_DECIMALS));
      setSolStakeUsdInput(usd);
    } else {
      setInputValue(value.toFixed(ROUNDING_DECIMALS));
    }
  }, [
    value,
    isUsdStake,
    solUsd,
    stakeDenomination,
    ROUNDING_DECIMALS,
    maxSol,
    maxUsd,
    setSolStakeUsdInput,
  ]);

  const handleOnChange = (raw: string) => {
    if (disabled) return;
    setInputValue(raw);
    if (isUsdStake && solUsd > 0) {
      const usd = clampToMaxUsd(parseFloat(raw) || 0);
      setSolStakeUsdInput(usd);
      const sol = clampToMaxSol(usd / solUsd);
      onChange(sol);
      return;
    }
    const newValue = clampToMaxSol(parseFloat(raw) || 0);
    onChange(newValue);
  };

  const handleOnHalf = () => {
    if (disabled) return;
    if (isUsdStake && solUsd > 0) {
      const usd = (solStakeUsdInput ?? value * solUsd) / 2;
      const u = clampToMaxUsd(usd);
      setSolStakeUsdInput(u);
      setInputValue(u.toFixed(USD_INPUT_DECIMALS));
      onChange(clampToMaxSol(u / solUsd));
      return;
    }
    const newValue = parseFloatValue(value / 2, ROUNDING_DECIMALS);
    setInputValue(newValue.toFixed(ROUNDING_DECIMALS));
    onChange(newValue);
  };

  const handleOnDouble = () => {
    if (disabled) return;
    if (isUsdStake && solUsd > 0) {
      const usd = (solStakeUsdInput ?? value * solUsd) * 2;
      const u = clampToMaxUsd(usd);
      const currMaxSol = getCurrencyMax(
        selectedBalance?.currency as Currency,
        'bet',
      );
      const u2 = Math.min(u, currMaxSol * solUsd);
      setSolStakeUsdInput(u2);
      setInputValue(u2.toFixed(USD_INPUT_DECIMALS));
      onChange(clampToMaxSol(u2 / solUsd));
      return;
    }
    const startValue = 1 / Math.pow(10, ROUNDING_DECIMALS);
    let val = value === 0 ? startValue : value * 2;
    val = Math.min(maxSol, val);
    const newValue = parseFloatValue(val, ROUNDING_DECIMALS);
    setInputValue(newValue.toFixed(ROUNDING_DECIMALS));
    onChange(newValue);
  };

  const handleOnBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    const raw = event.target.value;
    if (isUsdStake && solUsd > 0) {
      const usd = clampToMaxUsd(parseFloatValue(raw, USD_INPUT_DECIMALS));
      setSolStakeUsdInput(usd);
      const sol = clampToMaxSol(usd / solUsd);
      setInputValue(usd.toFixed(USD_INPUT_DECIMALS));
      onChange(sol);
      return;
    }
    const newValue = clampToMaxSol(
      parseFloatValue(raw, ROUNDING_DECIMALS),
    );
    setInputValue(newValue.toFixed(ROUNDING_DECIMALS));
    onChange(newValue);
  };

  const handleOnFocus = (event: React.FocusEvent<HTMLInputElement>) => {
    event.target.select();
  };

  const label = (): JSX.Element => {
    const showToggle = effectiveCurrency === Currency.SOL;
    /** One line only: the unit the input is *not* in (avoids repeating the typed amount). */
    const conversionHint =
      isUsdStake && solUsd > 0
        ? `≈ ${value.toFixed(ROUNDING_DECIMALS)} SOL`
        : effectiveCurrency === Currency.SOL && solUsd > 0
          ? `≈ $${(value * solUsd).toFixed(2)}`
          : null;

    return (
      <>
        <Box
          w="100%"
          display="flex"
          flexDirection="column"
          gap="4px"
          color="#D9D9D9"
          mb="2px">
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            w="100%"
            minW={0}
            gap="8px">
            <Text fontSize="14px" fontWeight="500" flexShrink={0}>
              Bet Amount
            </Text>
            {showToggle ? (
              <Box display="flex" gap="4px" flexShrink={0}>
                 <Button
                  type="button"
                  disabled={disabled}
                  onClick={() => {
                    if (solUsd > 0) {
                      setStakeDenomination(StakeDenomination.Usd);
                      setSolStakeUsdInput(value * solUsd);
                    }
                  }}
                  px="8px"
                  py="2px"
                  h="24px"
                  fontSize="11px"
                  bg={
                    stakeDenomination === StakeDenomination.Usd
                      ? 'rgba(120, 119, 150, 0.9)'
                      : 'rgba(78, 77, 101, 0.64)'
                  }
                  color="#FFFFFF"
                  borderRadius="6px">
                  USD
                </Button>
                <Button
                  type="button"
                  disabled={disabled}
                  onClick={() => {
                    setStakeDenomination(StakeDenomination.Native);
                    setSolStakeUsdInput(null);
                  }}
                  px="8px"
                  py="2px"
                  h="24px"
                  fontSize="11px"
                  bg={
                    stakeDenomination === StakeDenomination.Native
                      ? 'rgba(120, 119, 150, 0.9)'
                      : 'rgba(78, 77, 101, 0.64)'
                  }
                  color="#FFFFFF"
                  borderRadius="6px">
                  SOL
                </Button>
              </Box>
            ) : null}
          </Box>
          {conversionHint ? (
            <Box w="100%" pr="14px" textAlign="right" mt="8px">
              <Text
                as="span"
                display="block"
                fontSize="14px"
                color="#9ca3af"
                title="Approximate stake in the other currency (for reference only)">
                {conversionHint}
              </Text>
            </Box>
          ) : null}
        </Box>
      </>
    );
  };

  const startElement = () => (
    <Box>
      <WalletCurrencyIcon
        currency={walletCurrency}
        usdDenominatedSol={isUsdStake}
      />
    </Box>
  );

  const endElement = () => {
    return (
      <>
        <Box display={'flex'} alignItems={'center'} justifyContent={'center'}>
          <Button
            disabled={disabled}
            onClick={handleOnHalf}
            mr={'6px'}
            px={'0px'}
            py={'0px'}
            bg={'rgba(78, 77, 101, 0.64)'}
            color={'#FFFFFF'}
            borderRadius={'8px'}>
            ½
          </Button>
          <Button
            disabled={disabled}
            onClick={handleOnDouble}
            mr={'0px'}
            px={'0px'}
            py={'0px'}
            bg={'rgba(78, 77, 101, 0.64)'}
            color={'#FFFFFF'}
            borderRadius={'8px'}>
            2X
          </Button>
        </Box>
      </>
    );
  };

  return (
    <Box>
      <CustomInput
        disabled={disabled}
        type='number'
        value={inputValue}
        max={isUsdStake ? maxUsd : maxSol}
        onBlur={handleOnBlur}
        onFocus={handleOnFocus}
        onChange={e => handleOnChange(e.target.value)}
        fieldProps={{ label: label(), errorText: error }}
        inputGroupProps={{
          startElement: startElement(),
          endElement: endElement(),
        }}
      />
    </Box>
  );
};

export default BetAmount;
