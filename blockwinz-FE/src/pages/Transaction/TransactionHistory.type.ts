import { Currency } from "@blockwinz/shared";

export type TransactionHistoryT = {
    _id: string;
    transactionAmount: number;
    createdAt: string;
    currency: Currency;
    status: string;
    type: string;
}
