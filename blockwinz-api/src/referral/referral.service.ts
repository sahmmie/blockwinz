import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { ReferralStatus } from './dtos/referral-tracking.dto';
import { ReferralStatsResponseDto } from './dtos/referral-tracking.dto';
import { DRIZZLE } from 'src/database/constants';
import type { DrizzleDb } from 'src/database/database.module';
import { referrals } from 'src/database/schema/referrals';
import { referralSettings } from 'src/database/schema/referral-settings';
import { profiles } from 'src/database/schema/profiles';
import { eq, and, lt, inArray } from 'drizzle-orm';
import type { ProfileSelect } from 'src/database/schema/profiles';
import type {
  ReferralSelect,
  ReferralInsert,
} from 'src/database/schema/referrals';

@Injectable()
export class ReferralService {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDb) {}

  async generateReferralCode(userId: string): Promise<string> {
    const [settings] = await this.db.select().from(referralSettings).limit(1);
    if (!settings) {
      throw new NotFoundException('Referral settings not found');
    }

    const [profile] = await this.db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, userId))
      .limit(1);
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    if (profile.referralCode) {
      return profile.referralCode;
    }

    const code = this.generateUniqueCode(
      settings.referralCodePrefix,
      settings.referralCodeLength,
    );

    await this.db
      .update(profiles)
      .set({
        referralCode: code,
        updatedAt: new Date(),
      } as Partial<ProfileSelect>)
      .where(eq(profiles.id, profile.id));

    return code;
  }

  private generateUniqueCode(prefix: string, length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code: string;
    do {
      code =
        prefix +
        Array.from({ length }, () =>
          chars.charAt(Math.floor(Math.random() * chars.length)),
        ).join('');
    } while (this.isCodeExists(code));
    return code;
  }

  private async isCodeExists(code: string): Promise<boolean> {
    const [profile] = await this.db
      .select()
      .from(profiles)
      .where(eq(profiles.referralCode, code))
      .limit(1);
    return !!profile;
  }

  async processReferral(referrerId: string, referredId: string): Promise<void> {
    const [settings] = await this.db.select().from(referralSettings).limit(1);
    if (!settings) {
      throw new NotFoundException('Referral settings not found');
    }

    const [referrerProfile] = await this.db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, referrerId))
      .limit(1);
    const [referredProfile] = await this.db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, referredId))
      .limit(1);

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
        status: ReferralStatus.PENDING,
        timestamp: new Date(),
        reason: 'Referral initiated',
      },
    ];
    const expiresAt = new Date(
      Date.now() + settings.referralCompletionTimeframe * 24 * 60 * 60 * 1000,
    );

    await this.db.insert(referrals).values({
      referrer: referrerId,
      referred: referredId,
      status: ReferralStatus.PENDING,
      rewardAmount: '0',
      conditions,
      progress,
      history,
      expiresAt,
    } as ReferralInsert);

    await this.db
      .update(profiles)
      .set({
        referredBy: referrerId,
        updatedAt: new Date(),
      } as Partial<ProfileSelect>)
      .where(eq(profiles.id, referredProfile.id));

    await this.db
      .update(profiles)
      .set({
        referralCount: (referrerProfile.referralCount ?? 0) + 1,
        updatedAt: new Date(),
      } as Partial<ProfileSelect>)
      .where(eq(profiles.id, referrerProfile.id));
  }

  async updateReferralProgress(
    userId: string,
    depositAmount: number,
    betAmount: number,
  ): Promise<void> {
    const [referral] = await this.db
      .select()
      .from(referrals)
      .where(
        and(
          eq(referrals.referred, userId),
          eq(referrals.status, ReferralStatus.PENDING),
        ),
      )
      .limit(1);
    if (!referral) return;

    const [settings] = await this.db.select().from(referralSettings).limit(1);
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
      newStatus = ReferralStatus.ACTIVE;
      newHistory.push({
        status: ReferralStatus.ACTIVE,
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
      newStatus = ReferralStatus.COMPLETED;
      rewardAmount = (settings.rewardPercentage * newTotalDeposits) / 100;
      completedAt = new Date();
      newHistory.push({
        status: ReferralStatus.COMPLETED,
        timestamp: new Date() as unknown as string,
        reason: 'All conditions met',
      });

      const [referrerProfile] = await this.db
        .select()
        .from(profiles)
        .where(eq(profiles.userId, referral.referrer))
        .limit(1);
      if (referrerProfile) {
        await this.db
          .update(profiles)
          .set({
            referralEarnings:
              (referrerProfile.referralEarnings ?? 0) + rewardAmount,
            updatedAt: new Date(),
          } as Partial<ProfileSelect>)
          .where(eq(profiles.id, referrerProfile.id));
      }
    }

    await this.db
      .update(referrals)
      .set({
        progress: newProgress,
        history: newHistory,
        status: newStatus,
        rewardAmount: String(rewardAmount),
        completedAt,
        updatedAt: new Date(),
      } as Partial<ReferralSelect>)
      .where(eq(referrals.id, referral.id));
  }

  async getReferralStats(userId: string): Promise<ReferralStatsResponseDto> {
    const referralRows = await this.db
      .select()
      .from(referrals)
      .where(eq(referrals.referrer, userId));

    const completedReferrals = referralRows.filter(
      (r) => r.status === ReferralStatus.COMPLETED,
    );
    const activeReferrals = referralRows.filter(
      (r) => r.status === ReferralStatus.ACTIVE,
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
    const expiredRows = await this.db
      .select()
      .from(referrals)
      .where(
        and(
          inArray(referrals.status, [
            ReferralStatus.PENDING,
            ReferralStatus.ACTIVE,
          ]),
          lt(referrals.expiresAt, new Date()),
        ),
      );

    for (const referral of expiredRows) {
      const history =
        (referral.history as Array<{
          status: string;
          timestamp: string | Date;
          reason?: string;
        }>) ?? [];
      await this.db
        .update(referrals)
        .set({
          status: ReferralStatus.EXPIRED,
          history: [
            ...history,
            {
              status: ReferralStatus.EXPIRED,
              timestamp: new Date() as unknown as string,
              reason: 'Referral timeframe expired',
            },
          ],
          updatedAt: new Date(),
        } as Partial<ReferralSelect>)
        .where(eq(referrals.id, referral.id));
    }
  }
}
