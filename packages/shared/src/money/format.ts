/**
 * Format minor units (e.g. kobo / cents) for display — adjust per product rules.
 */
export function formatMinorUnits(
  amountMinor: bigint | number,
  fractionDigits = 2,
): string {
  const n = typeof amountMinor === 'bigint' ? Number(amountMinor) : amountMinor;
  return (n / 100).toFixed(fractionDigits);
}
