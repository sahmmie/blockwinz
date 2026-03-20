export declare enum ReferralStatus {
    PENDING = "PENDING",
    ACTIVE = "ACTIVE",
    COMPLETED = "COMPLETED",
    EXPIRED = "EXPIRED",
    CANCELLED = "CANCELLED"
}
export declare class ReferralProgressDto {
    totalDeposits: number;
    totalBets: number;
    lastActivity: Date;
}
export declare class ReferralHistoryEntryDto {
    status: ReferralStatus;
    timestamp: Date;
    reason?: string;
    details?: any;
}
export declare class ReferralTrackingDto {
    status: ReferralStatus;
    rewardAmount: number;
    minimumDeposit: number;
    minimumBets: number;
    timeframe: number;
    progress: ReferralProgressDto;
    history: ReferralHistoryEntryDto[];
    completedAt?: Date;
    expiresAt: Date;
}
export declare class ReferralStatsResponseDto {
    totalReferrals: number;
    activeReferrals: number;
    completedReferrals: number;
    totalEarnings: number;
    successRate: number;
    averageCompletionTime: number;
}
//# sourceMappingURL=referral-tracking.dto.d.ts.map