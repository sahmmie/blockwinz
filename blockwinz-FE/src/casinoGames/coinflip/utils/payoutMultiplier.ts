/**
 * Client-side payout math aligned with `@blockwinz/api` coin flip service (fair binomial, RTP 0.99, 2 dp).
 */
function factorial(n: number): number {
  if (n <= 1) return 1;
  return n * factorial(n - 1);
}

function binomialPm(n: number, k: number, p = 0.5): number {
  const combinations = factorial(n) / (factorial(k) * factorial(n - k));
  return combinations * Math.pow(p, k) * Math.pow(1 - p, n - k);
}

function winProbability(coins: number, minRequired: number): number {
  let winProb = 0;
  for (let i = minRequired; i <= coins; i++) {
    winProb += binomialPm(coins, i);
  }
  return winProb;
}

/**
 * Gross payout multiplier on a winning round before RTP (1 / win probability).
 * Matches API `checkTheoreticalProfit` so client max-profit validation aligns with the server.
 */
export function getCoinFlipFairGrossMultiplier(
  coins: number,
  minRequired: number,
): number {
  const winProb = winProbability(coins, minRequired);
  if (winProb <= 0) return 0;
  return 1 / winProb;
}

/** Payout multiplier when the configured min matches are hit (0.99 RTP, rounded to 2 decimals). */
export function getCoinFlipPayoutMultiplier(
  coins: number,
  minRequired: number,
): number {
  const fairMultiplier = getCoinFlipFairGrossMultiplier(coins, minRequired);
  if (fairMultiplier <= 0) return 0;
  return Math.round(fairMultiplier * 0.99 * 100) / 100;
}

/** Net profit on a winning round: stake × multiplier − stake. */
export function getCoinFlipProfitOnWin(
  betAmount: number,
  coins: number,
  min: number,
): number {
  const m = getCoinFlipPayoutMultiplier(coins, min);
  return betAmount * m - betAmount;
}
