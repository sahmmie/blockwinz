import { Currency } from "../enums/currency.enum";
import SolIcon from 'assets/icons/solana-icon.svg'
import BwzIcon from 'assets/bw.svg'

export const currencyIconMap: { [key in Currency]: string } = {
    [Currency.SOL]: SolIcon,
    [Currency.BWZ]: BwzIcon
};