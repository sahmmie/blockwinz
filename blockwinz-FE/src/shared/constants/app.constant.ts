import { Currency } from "@blockwinz/shared";
import pkg from '../../../package.json';

function requireEnv(name: keyof ImportMetaEnv): string {
  const value = import.meta.env[name];
  if (!value || !String(value).trim()) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return String(value).trim();
}

function readOptionalEnv(name: keyof ImportMetaEnv): string {
  return (import.meta.env[name] as string | undefined)?.trim() ?? '';
}

function readBooleanEnv(
  name: keyof ImportMetaEnv,
  defaultValue: boolean,
): boolean {
  const value = readOptionalEnv(name).toLowerCase();
  if (!value) {
    return defaultValue;
  }
  if (['1', 'true', 'yes', 'on'].includes(value)) {
    return true;
  }
  if (['0', 'false', 'no', 'off'].includes(value)) {
    return false;
  }
  throw new Error(`Invalid boolean environment variable: ${name}`);
}

function readAppEnv(): string {
  const value = requireEnv('VITE_REACT_APP_ENV');
  if (!['dev', 'development', 'staging', 'prod', 'production'].includes(value)) {
    throw new Error(`Invalid VITE_REACT_APP_ENV value: ${value}`);
  }
  return value;
}

function readPosthogConfig() {
  const enabled = readBooleanEnv('VITE_POSTHOG_ENABLED', false);
  if (!enabled) {
    return {
      enabled,
      key: '',
      host: '',
      enableSessionReplay: false,
      enableSurveys: false,
      chatwootFlagKey: '',
    };
  }

  return {
    enabled,
    key: requireEnv('VITE_POSTHOG_KEY'),
    host: requireEnv('VITE_POSTHOG_HOST'),
    enableSessionReplay: readBooleanEnv('VITE_POSTHOG_ENABLE_SESSION_REPLAY', false),
    enableSurveys: readBooleanEnv('VITE_POSTHOG_ENABLE_SURVEYS', false),
    chatwootFlagKey: readOptionalEnv('VITE_POSTHOG_CHATWOOT_FLAG_KEY'),
  };
}

const posthogConfig = readPosthogConfig();

export const APP_VERSION = pkg.version; 
export const SERVER_BASE_URL = requireEnv('VITE_REACT_APP_SERVER_BASE_URL')
export const TOKEN_NAME = requireEnv('VITE_REACT_APP_TOKEN_NAME')
export const APP_ENV = readAppEnv()
export const WAITLIST_LAUNCH_DATE = (import.meta.env.VITE_WAITLIST_LAUNCH_DATE as string | undefined)?.trim() ?? ''
export const POSTHOG_ENABLED = posthogConfig.enabled
export const POSTHOG_KEY = posthogConfig.key
export const POSTHOG_HOST = posthogConfig.host
export const POSTHOG_ENABLE_SESSION_REPLAY = posthogConfig.enableSessionReplay
export const POSTHOG_ENABLE_SURVEYS = posthogConfig.enableSurveys
export const POSTHOG_CHATWOOT_FLAG_KEY = posthogConfig.chatwootFlagKey


/** Wallet / deposit / withdraw options. BWZ omitted until launch. */
export const SUPPORTED_CURRENCIES: { chain: string, currency: Currency, network: string[], withdrawalFee: number, decimals: number }[] = [
    { chain: 'Solana', currency: Currency.SOL, network: ['sol'], withdrawalFee: 0.0001, decimals: 4 },
];

export const DEFAULT_CURRENCY = Currency.SOL

export const DEFAULT_ROUNDING_DECIMALS = 2
