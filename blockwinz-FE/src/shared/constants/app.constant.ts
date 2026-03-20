import { Currency } from "../enums/currency.enum";
import pkg from '../../../package.json';

export const APP_VERSION = pkg.version; 
export const SERVER_BASE_URL = import.meta.env.VITE_REACT_APP_SERVER_BASE_URL as string
export const TOKEN_NAME = import.meta.env.VITE_REACT_APP_TOKEN_NAME as string
export const APP_ENV = import.meta.env.VITE_REACT_APP_ENV as string
export const WS_URL = import.meta.env.VITE_REACT_APP_WS_URL as string
export const WAITLIST_LAUNCH_DATE = import.meta.env.VITE_WAITLIST_LAUNCH_DATE as string


export const SUPPORTED_CURRENCIES: { chain: string, currency: Currency, network: string[], withdrawalFee: number, decimals: number }[] = [
    { chain: 'Solana', currency: Currency.SOL, network: ['sol'], withdrawalFee: 0.0001, decimals: 4 },
    { chain: 'Solana', currency: Currency.BWZ, network: ['bwz'], withdrawalFee: 0.001, decimals: 2 },
];

export const DEFAULT_CURRENCY = Currency.SOL

export const DEFAULT_ROUNDING_DECIMALS = 2
