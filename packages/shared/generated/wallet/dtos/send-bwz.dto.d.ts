export declare class CreditFreeBwzDtoReq {
    username: string;
    amount: number;
    walletAddress: string;
}
export declare class CreditFreeBwzDto {
    username: string;
    sendHistory: Array<{
        amount: number;
        timestamp: Date;
        signature: string;
        walletAddress: string;
    }>;
    totalSent: number;
    createdAt: Date;
    updatedAt: Date;
}
//# sourceMappingURL=send-bwz.dto.d.ts.map