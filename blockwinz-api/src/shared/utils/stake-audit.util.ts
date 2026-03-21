import { StakeDenomination } from '@blockwinz/shared';

export function stakeAuditFromRequest(request: {
  stakeDenomination?: StakeDenomination;
  usdAmount?: number;
  betAmount: number;
}):
  | { usdAmountRequested: number; solUsdRateAtBet: number }
  | undefined {
  if (
    request.stakeDenomination !== StakeDenomination.Usd ||
    request.usdAmount == null ||
    request.betAmount <= 0
  ) {
    return undefined;
  }
  return {
    usdAmountRequested: request.usdAmount,
    solUsdRateAtBet: request.usdAmount / request.betAmount,
  };
}
