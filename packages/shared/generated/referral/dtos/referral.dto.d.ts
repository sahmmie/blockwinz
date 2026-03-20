import { ReferralStatus } from './referral-tracking.dto';
export declare class ReferralResponseDto {
    referralCode: string;
    referralCount: number;
    referralEarnings: number;
}
export declare class ReferralStatsDto {
    totalReferrals: number;
    activeReferrals: number;
    totalEarnings: number;
}
export declare class UpdateReferralStatusDto {
    status: ReferralStatus;
    rewardAmount?: number;
}
export declare class ReferralDto {
    _id?: string;
    referrer: string;
    referred: string;
    status: ReferralStatus;
    rewardAmount: number;
    conditions: {
        minimumDeposit: number;
        minimumBets: number;
        timeframe: number;
    };
    progress: {
        totalDeposits: number;
        totalBets: number;
        lastActivity: Date;
    };
    history: Array<{
        status: ReferralStatus;
        timestamp: Date;
        reason?: string;
        details?: any;
    }>;
    completedAt?: Date;
    expiresAt: Date;
    createdAt?: Date;
    updatedAt?: Date;
}
//# sourceMappingURL=referral.dto.d.ts.map