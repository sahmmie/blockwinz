import { Request } from 'express';
import BigNumber from 'bignumber.js';
import { ROUND_DECIMALS } from '../constants/extra.constatnt';

export const generateToken = (): string => {
  return;
};

export const generateShortUUID = (): string => {
  return;
};

export const metersToKilometers = (): number => {
  return;
};

export const extractTokenFromHeader = (
  request: Request,
): string | undefined => {
  const [type, token] = request.headers.authorization?.split(' ') ?? [];
  return type === 'Bearer' ? token : undefined;
};

/**
 * Adjusts a raw numeric value based on its decimal places.
 *
 * @param rawValue - The scaled value to be adjusted (e.g., 1000000000).
 * @param decimals - The number of decimal places the value uses (e.g., 8).
 * @returns The human-readable value (e.g., 10).
 */
export const convertFromDecimal = (
  rawValue: string | number,
  decimals: number,
): BigNumber => {
  return BigNumber(rawValue).div(BigNumber(10).pow(decimals));
};

/**
 * Converts a human-readable value to its scaled representation based on decimal places.
 *
 * @param value - The human-readable value as a string (e.g., "10").
 * @param decimals - The number of decimal places to scale to (e.g., 8).
 * @returns The scaled value as a string (e.g., "1000000000").
 */
export const convertToDecimal = (
  value: string | number,
  decimals: number,
): BigNumber => {
  return BigNumber(value).times(BigNumber(10).pow(decimals));
};

export const balanceIsSufficient = (
  amount: number,
  balance: number,
): boolean => {
  const amountBig = BigNumber(amount);
  const minAmountBig = BigNumber(balance);
  return amountBig.lte(minAmountBig);
};

export const roundToDecimals = (
  value: number,
  decimals: number = ROUND_DECIMALS,
): number => {
  return new BigNumber(value)
    .decimalPlaces(decimals, BigNumber.ROUND_HALF_EVEN)
    .toNumber();
};

export const readableSecretKey = (secretKey: Uint8Array): string => {
  return Buffer.from(secretKey).toString('base64');
};
