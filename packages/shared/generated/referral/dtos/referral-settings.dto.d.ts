export declare class ReferralSettingsDto {
    _id?: string;
    minimumDepositAmount: number;
    rewardPercentage: number;
    maxReferralsPerUser: number;
    referralCompletionTimeframe: number;
    referralCodePrefix: string;
    referralCodeLength: number;
    isActive: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}
export declare class UpdateReferralSettingsDto {
    minimumDepositAmount?: number;
    rewardPercentage?: number;
    maxReferralsPerUser?: number;
    referralCompletionTimeframe?: number;
    referralCodePrefix?: string;
    referralCodeLength?: number;
    isActive?: boolean;
}
//# sourceMappingURL=referral-settings.dto.d.ts.map