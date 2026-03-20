import { Currency } from "@/shared/enums/currency.enum";

export type TransactionHistoryT = {
    _id: string;
    transactionAmount: number;
    createdAt: string;
    currency: Currency;
    status: string;
    type: string;
}
