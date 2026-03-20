import { TransactionDto } from 'src/transaction/dtos/transaction.dto';
import { UserRequestI } from 'src/shared/interfaces/userRequest.type';
import { Currency } from '@blockwinz/shared';
export declare class WalletQueueDto {
    user: UserRequestI;
    amount: number;
    transaction: TransactionDto;
    currency: Currency;
}
//# sourceMappingURL=walletQueue.dto.d.ts.map