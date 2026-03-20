import { TransactionStatus, TransactionType } from '@blockwinz/shared';
import { DbGameSchema } from '@blockwinz/shared';
import { CHAIN, Currency } from '@blockwinz/shared';
import { WithdrawalDto } from 'src/withdrawal/dtos/withdrawal.dto';
export declare class TransactionDto {
    _id?: string;
    user: string;
    type: TransactionType;
    status: TransactionStatus;
    transactionAmount: number;
    fulfillmentDate?: Date;
    game?: string;
    gameModel?: DbGameSchema;
    metadata: any;
    onChain: boolean;
    createdAt?: Date;
    updatedAt?: Date;
    txid?: string;
    chain: CHAIN;
    currency: Currency;
    withdrawal?: string | WithdrawalDto;
    __v?: string;
}
//# sourceMappingURL=transaction.dto.d.ts.map