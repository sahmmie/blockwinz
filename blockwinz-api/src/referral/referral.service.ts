import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ReferralTrackingStatus } from './dtos/referral-tracking.dto';
import { ReferralStatsResponseDto } from './dtos/referral-tracking.dto';
import type { ProfileSelect } from 'src/database/schema/profiles';
import type { ReferralInsert } from 'src/database/schema/referrals';
import { ReferralRepository } from './repositories/referral.repository';

@Injectable()
export class ReferralService {
  constructor(private readonly referralRepository: ReferralRepository) {}

  async generateReferralCode(userId: string): Promise<string> {
    const settings = await this.referralRepository.findFirstReferralSettings();
    if (!settings) {
      throw new NotFoundException('Referral settings not found');
    }

    const profile = await this.referralRepository.findProfileByUserId(userId);
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    if (profile.referralCode) {
      return profile.referralCode;
    }

    const code = await this.generateUniqueCode(
      settings.referralCodePrefix,
      settings.referralCodeLength,
    );

    await this.referralRepository.updateProfileById(profile.id, {
      referralCode: code,
    } as Partial<ProfileSelect>);

    return code;
  }

  private async generateUniqueCode(
    prefix: string,
    length: number,
  ): Promise<string> {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code: string;
    do {
      code =
        prefix +
        Array.from({ length }, () =>
          chars.charAt(Math.floor(Math.random() * chars.length)),
        ).join('');
    } while (await this.isCodeExists(code));
    return code;
  }

  private async isCodeExists(code: string): Promise<boolean> {
    const profile =
      await this.referralRepository.findProfileByReferralCode(code);
    return !!profile;
  }

  async processReferral(referrerId: string, referredId: string): Promise<void> {
    const settings = await this.referralRepository.findFirstReferralSettings();
    if (!settings) {
      throw new NotFoundException('Referral settings not found');
    }

    const referrerProfile =
      await this.referralRepository.findProfileByUserId(referrerId);
    const referredProfile =
      await this.referralRepository.findProfileByUserId(referredId);

    if (!referrerProfile || !referredProfile) {
      throw new NotFoundException('Profile not found');
    }

    if (referredProfile.referredBy) {
      throw new BadRequestException('User already has a referrer');
    }

    const conditions = {
      minimumDeposit: settings.minimumDepositAmount,
      minimumBets: 0,
      timeframe: settings.referralCompletionTimeframe,
    };
    const progress = {
      totalDeposits: 0,
      totalBets: 0,
      lastActivity: new Date(),
    };
    const history = [
      {
        status: ReferralTrackingStatus.PENDING,
        timestamp: new Date(),
        reason: 'Referral initiated',
      },
    ];
    const expiresAt = new Date(
      Date.now() + settings.referralCompletionTimeframe * 24 * 60 * 60 * 1000,
    );

    await this.referralRepository.insertReferral({
      referrer: referrerId,
      referred: referredId,
      status: ReferralTrackingStatus.PENDING,
      rewardAmount: '0',
      conditions,
      progress,
      history,
      expiresAt,
    } as ReferralInsert);

    await this.referralRepository.updateProfileById(referredProfile.id, {
      referredBy: referrerId,
    } as Partial<ProfileSelect>);

    await this.referralRepository.updateProfileById(referrerProfile.id, {
      referralCount: (referrerProfile.referralCount ?? 0) + 1,
    } as Partial<ProfileSelect>);
  }

  async updateReferralProgress(
    userId: string,
    depositAmount: number,
    betAmount: number,
  ): Promise<void> {
    const referral =
      await this.referralRepository.findPendingReferralByReferred(userId);
    if (!referral) return;

    const settings = await this.referralRepository.findFirstReferralSettings();
    if (!settings) return;

    const progress = referral.progress as {
      totalDeposits: number;
      totalBets: number;
      lastActivity: string;
    };
    const conditions = referral.conditions as {
      minimumDeposit: number;
      minimumBets: number;
      timeframe: number;
    };
    const history =
      (referral.history as Array<{
        status: string;
        timestamp: string | Date;
        reason?: string;
      }>) ?? [];

    const newTotalDeposits = (progress?.totalDeposits ?? 0) + depositAmount;
    const newTotalBets = (progress?.totalBets ?? 0) + betAmount;
    const newProgress = {
      totalDeposits: newTotalDeposits,
      totalBets: newTotalBets,
      lastActivity: new Date(),
    };

    let newStatus = referral.status;
    const newHistory = [...history];

    if (newTotalDeposits >= (conditions?.minimumDeposit ?? 0)) {
      newStatus = ReferralTrackingStatus.ACTIVE;
      newHistory.push({
        status: ReferralTrackingStatus.ACTIVE,
        timestamp: new Date() as unknown as string,
        reason: 'Minimum deposit requirement met',
      });
    }

    let rewardAmount = Number(referral.rewardAmount);
    let completedAt: Date | null = null;

    if (
      newTotalDeposits >= (conditions?.minimumDeposit ?? 0) &&
      newTotalBets >= (conditions?.minimumBets ?? 0)
    ) {
      newStatus = ReferralTrackingStatus.COMPLETED;
      rewardAmount = (settings.rewardPercentage * newTotalDeposits) / 100;
      completedAt = new Date();
      newHistory.push({
        status: ReferralTrackingStatus.COMPLETED,
        timestamp: new Date() as unknown as string,
        reason: 'All conditions met',
      });

      const referrerProfile = await this.referralRepository.findProfileByUserId(
        referral.referrer,
      );
      if (referrerProfile) {
        await this.referralRepository.updateProfileById(referrerProfile.id, {
          referralEarnings:
            (referrerProfile.referralEarnings ?? 0) + rewardAmount,
        } as Partial<ProfileSelect>);
      }
    }

    await this.referralRepository.updateReferralById(referral.id, {
      progress: newProgress,
      history: newHistory,
      status: newStatus,
      rewardAmount: String(rewardAmount),
      completedAt,
    });
  }

  async getReferralStats(userId: string): Promise<ReferralStatsResponseDto> {
    const referralRows =
      await this.referralRepository.findReferralsByReferrer(userId);

    const completedReferrals = referralRows.filter(
      (r) => r.status === ReferralTrackingStatus.COMPLETED,
    );
    const activeReferrals = referralRows.filter(
      (r) => r.status === ReferralTrackingStatus.ACTIVE,
    );

    const totalEarnings = completedReferrals.reduce(
      (sum, r) => sum + Number(r.rewardAmount),
      0,
    );
    const successRate =
      referralRows.length > 0
        ? (completedReferrals.length / referralRows.length) * 100
        : 0;
    const averageCompletionTime =
      completedReferrals.length > 0
        ? completedReferrals.reduce(
            (sum, r) =>
              sum +
              (r.completedAt && r.createdAt
                ? new Date(r.completedAt).getTime() -
                  new Date(r.createdAt).getTime()
                : 0),
            0,
          ) / completedReferrals.length
        : 0;

    return {
      totalReferrals: referralRows.length,
      activeReferrals: activeReferrals.length,
      completedReferrals: completedReferrals.length,
      totalEarnings,
      successRate,
      averageCompletionTime,
    };
  }

  async checkExpiredReferrals(): Promise<void> {
    const expiredRows =
      await this.referralRepository.findExpiredPendingOrActiveReferrals();

    for (const referral of expiredRows) {
      const history =
        (referral.history as Array<{
          status: string;
          timestamp: string | Date;
          reason?: string;
        }>) ?? [];
      await this.referralRepository.updateReferralById(referral.id, {
        status: ReferralTrackingStatus.EXPIRED,
        history: [
          ...history,
          {
            status: ReferralTrackingStatus.EXPIRED,
            timestamp: new Date() as unknown as string,
            reason: 'Referral timeframe expired',
          },
        ],
      });
    }
  }
}
