import { Currency } from "@blockwinz/shared";
import pkg from '../../../package.json';

function requireEnv(name: keyof ImportMetaEnv): string {
  const value = import.meta.env[name];
  if (!value || !String(value).trim()) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return String(value).trim();
}

function readAppEnv(): string {
  const value = requireEnv('VITE_REACT_APP_ENV');
  if (!['dev', 'development', 'staging', 'prod', 'production'].includes(value)) {
    throw new Error(`Invalid VITE_REACT_APP_ENV value: ${value}`);
  }
  return value;
}

export const APP_VERSION = pkg.version; 
export const SERVER_BASE_URL = requireEnv('VITE_REACT_APP_SERVER_BASE_URL')
export const TOKEN_NAME = requireEnv('VITE_REACT_APP_TOKEN_NAME')
export const APP_ENV = readAppEnv()
export const WAITLIST_LAUNCH_DATE = (import.meta.env.VITE_WAITLIST_LAUNCH_DATE as string | undefined)?.trim() ?? ''


/** Wallet / deposit / withdraw options. BWZ omitted until launch. */
export const SUPPORTED_CURRENCIES: { chain: string, currency: Currency, network: string[], withdrawalFee: number, decimals: number }[] = [
    { chain: 'Solana', currency: Currency.SOL, network: ['sol'], withdrawalFee: 0.0001, decimals: 4 },
];

export const DEFAULT_CURRENCY = Currency.SOL

export const DEFAULT_ROUNDING_DECIMALS = 2
