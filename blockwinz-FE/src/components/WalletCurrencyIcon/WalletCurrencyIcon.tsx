import { Box, Text } from '@chakra-ui/react';
import { Currency } from '@blockwinz/shared';
import { currencyIconMap } from '@/shared/utils/gameMaps';
import { Tooltip } from '@/components/ui/tooltip';

const USD_DENOMINATED_SOL_TOOLTIP = (
  <Text fontSize="sm" lineHeight="short">
    SOL balance: you enter USD, converted to SOL when you bet.
  </Text>
);

type WalletCurrencyIconProps = {
  /** Active wallet token (SOL / BWZ). */
  currency: Currency;
  /**
   * SOL wallet with stake/profit shown in USD — show SOL as primary and USD as a small badge.
   */
  usdDenominatedSol?: boolean;
};

/**
 * Input leading icon: normal single token, or SOL + USD badge when entering USD on a SOL balance.
 */
export function WalletCurrencyIcon({
  currency,
  usdDenominatedSol = false,
}: WalletCurrencyIconProps) {
  const src = currencyIconMap[currency];

  if (currency === Currency.SOL && usdDenominatedSol) {
    return (
      <Tooltip
        content={USD_DENOMINATED_SOL_TOOLTIP}
        showArrow
        openDelay={150}
        portalled
        positioning={{ placement: 'top' }}>
        <Box
          position="relative"
          w="26px"
          h="22px"
          flexShrink={0}
          role="img"
          aria-label="SOL balance, amount in USD"
          cursor="help"
          display="inline-block"
          pointerEvents="auto">
          <img
            src={currencyIconMap[Currency.SOL]}
            alt=""
            width={22}
            height={22}
            style={{ display: 'block' }}
          />
          <Box
            position="absolute"
            right="-1px"
            bottom="-1px"
            w="14px"
            h="14px"
            borderRadius="full"
            overflow="hidden"
            bg="#0a0f24"
            boxShadow="0 0 0 1.5px rgba(15, 23, 42, 0.95)">
            <img
              src={currencyIconMap.usd}
              alt=""
              width={14}
              height={14}
              style={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </Box>
        </Box>
      </Tooltip>
    );
  }

  return (
    <Box flexShrink={0}>
      <img src={src} alt="" width={22} height={22} style={{ display: 'block' }} />
    </Box>
  );
}
