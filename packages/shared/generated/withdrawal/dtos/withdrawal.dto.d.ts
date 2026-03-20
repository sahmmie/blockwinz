import { Currency } from '@blockwinz/shared';
import { WithdrawalStatus } from '@blockwinz/shared';
import { ApprovalType } from '@blockwinz/shared';
export declare class WithdrawalDto {
    _id?: string;
    userId: string;
    amount: number;
    currency: Currency;
    destinationAddress: string;
    requestId: string;
    status?: WithdrawalStatus;
    approvedBy?: string;
    approvedAt?: Date;
    rejectedBy?: string;
    rejectedAt?: Date;
    rejectionReason?: string;
    processedAt: Date;
    transactionHash: string;
    approvalType: ApprovalType;
    error?: string;
}
export declare class WithdrawalDtoRequest {
    amount: number;
    currency: Currency;
    destinationAddress: string;
}
//# sourceMappingURL=withdrawal.dto.d.ts.map