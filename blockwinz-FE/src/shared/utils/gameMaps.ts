import { Currency } from "@blockwinz/shared";
import SolIcon from 'assets/icons/solana-icon.svg'
import DollarIcon from 'assets/icons/dollar-icon.svg'
import BwzIcon from 'assets/bw.svg'

/**
 * Icons per wallet currency plus `usd` for USD-denominated stake input on SOL (not a DB / API wallet currency).
 */
export const currencyIconMap = {
  [Currency.SOL]: SolIcon,
  [Currency.BWZ]: BwzIcon,
  usd: DollarIcon,
} as const satisfies Record<Currency, string> & { usd: string };
