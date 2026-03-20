import { UserDto } from 'src/shared/dtos/user.dto';
import { CHAIN, Currency } from '@blockwinz/shared';
export declare class WalletDto {
    _id?: string;
    user: string | UserDto;
    address: string;
    privateKey?: string;
    publicKey?: string;
    currency: Currency;
    chain: CHAIN;
    onChainBalance: number;
    appBalance: number;
    pendingWithdrawal: number;
    lockedInBets: number;
    availableBalance?: number;
    syncedAt: Date;
    createdAt?: string;
    updatedAt?: string;
}
//# sourceMappingURL=wallet.dto.d.ts.map