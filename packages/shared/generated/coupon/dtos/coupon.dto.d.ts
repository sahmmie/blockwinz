import { RewardType } from '@blockwinz/shared';
import { RequiredTask } from '@blockwinz/shared';
export declare class CreateCouponDto {
    code: string;
    rewardAmount: number;
    rewardType: RewardType;
    expiryDate: Date;
    maxRedemptions?: number;
    isActive?: boolean;
    requiredTasks?: RequiredTask[];
    minimumDepositAmount?: number;
    minGamesPlayed?: number;
    claimDelayInHours?: number;
    loginStreakRequired?: number;
    customConditionFnName?: string;
    description?: string;
}
export declare class ClaimCouponDto {
    code: string;
}
export declare class CouponResponseDto {
    code: string;
    rewardAmount: number;
    rewardType: RewardType;
    expiryDate: Date;
    isActive: boolean;
    description?: string;
    currentRedemptions: number;
    maxRedemptions: number;
}
export declare class CouponDto {
    _id?: string;
    code: string;
    rewardAmount: number;
    rewardType: RewardType;
    expiryDate: Date;
    maxRedemptions: number;
    isActive: boolean;
    requiredTasks: RequiredTask[];
    minimumDepositAmount: number;
    minGamesPlayed: number;
    claimDelayInHours: number;
    loginStreakRequired: number;
    customConditionFnName?: string;
    redeemedBy: string[];
    currentRedemptions: number;
    description?: string;
    createdAt?: Date;
    updatedAt?: Date;
}
//# sourceMappingURL=coupon.dto.d.ts.map