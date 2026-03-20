import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Inject } from '@nestjs/common';
import {
  CreateCouponDto,
  ClaimCouponDto,
  CouponResponseDto,
  CouponDto,
} from './dtos/coupon.dto';
import { RewardType } from 'src/shared/enums/rewardType.enum';
import { RequiredTask } from 'src/shared/enums/requiredTask.enum';
import { AuthenticationRepository } from '../authentication/repositories/authentication.repository';
import { BetHistoryRepository } from '../betHistory/repositories/betHistory.repository';
import { TransactionRepository } from '../transaction/repositories/transaction.repository';
import { ReferralService } from '../referral/referral.service';
import { WalletRepository } from '../wallet/repositories/wallet.repository';
import {
  TransactionType,
  TransactionStatus,
} from 'src/shared/enums/transaction.enums';
import { DRIZZLE } from 'src/database/constants';
import type { DrizzleDb } from 'src/database/database.module';
import { coupons } from 'src/database/schema/coupons';
import { eq } from 'drizzle-orm';
import type { CouponSelect, CouponInsert } from 'src/database/schema/coupons';

@Injectable()
export class CouponService {
  constructor(
    @Inject(DRIZZLE) private readonly db: DrizzleDb,
    private readonly authenticationRepository: AuthenticationRepository,
    private readonly betHistoryRepository: BetHistoryRepository,
    private readonly transactionRepository: TransactionRepository,
    private readonly referralService: ReferralService,
    private readonly walletRepository: WalletRepository,
  ) {}

  async createCoupon(createCouponDto: CreateCouponDto): Promise<CouponSelect> {
    const [existing] = await this.db
      .select()
      .from(coupons)
      .where(eq(coupons.code, createCouponDto.code))
      .limit(1);
    if (existing) {
      throw new BadRequestException('Coupon code already exists');
    }

    const [row] = await this.db
      .insert(coupons)
      .values({
        code: createCouponDto.code,
        rewardAmount: String(createCouponDto.rewardAmount),
        rewardType: createCouponDto.rewardType,
        expiryDate: createCouponDto.expiryDate,
        maxRedemptions: createCouponDto.maxRedemptions ?? 1,
        isActive: createCouponDto.isActive ?? true,
        requiredTasks: createCouponDto.requiredTasks ?? [],
        minimumDepositAmount:
          createCouponDto.minimumDepositAmount != null
            ? String(createCouponDto.minimumDepositAmount)
            : '0',
        minGamesPlayed: createCouponDto.minGamesPlayed ?? 0,
        claimDelayInHours: createCouponDto.claimDelayInHours ?? 0,
        loginStreakRequired: createCouponDto.loginStreakRequired ?? 0,
        description: createCouponDto.description ?? null,
      } as CouponInsert)
      .returning();
    if (!row) throw new Error('Failed to create coupon');
    return row;
  }

  async getCoupon(code: string): Promise<CouponDto> {
    const [row] = await this.db
      .select()
      .from(coupons)
      .where(eq(coupons.code, code))
      .limit(1);
    if (!row) {
      throw new NotFoundException('Coupon not found');
    }
    return this.rowToCouponDto(row);
  }

  private rowToCouponDto(row: CouponSelect): CouponDto {
    return {
      code: row.code,
      rewardAmount: Number(row.rewardAmount),
      rewardType: row.rewardType as RewardType,
      expiryDate: row.expiryDate,
      maxRedemptions: row.maxRedemptions ?? 1,
      isActive: row.isActive ?? true,
      requiredTasks: (row.requiredTasks ?? []) as RequiredTask[],
      minimumDepositAmount: Number(row.minimumDepositAmount ?? 0),
      minGamesPlayed: row.minGamesPlayed ?? 0,
      claimDelayInHours: row.claimDelayInHours ?? 0,
      loginStreakRequired: row.loginStreakRequired ?? 0,
      redeemedBy: row.redeemedBy ?? [],
      currentRedemptions: row.currentRedemptions ?? 0,
      description: row.description ?? undefined,
      createdAt: row.createdAt ?? undefined,
      updatedAt: row.updatedAt,
    } as CouponDto;
  }

  async claimCoupon(
    userId: string,
    claimCouponDto: ClaimCouponDto,
  ): Promise<CouponResponseDto> {
    const [row] = await this.db
      .select()
      .from(coupons)
      .where(eq(coupons.code, claimCouponDto.code))
      .limit(1);
    if (!row) {
      throw new NotFoundException('Coupon not found');
    }
    const coupon = this.rowToCouponDto(row);

    if (!coupon.isActive) {
      throw new BadRequestException('Coupon is not active');
    }

    if (coupon.expiryDate < new Date()) {
      throw new BadRequestException('Coupon has expired');
    }

    if (coupon.currentRedemptions >= coupon.maxRedemptions) {
      throw new BadRequestException('Coupon has reached maximum redemptions');
    }

    if (coupon.redeemedBy.includes(userId)) {
      throw new BadRequestException('You have already claimed this coupon');
    }

    await this.validateCouponConditions(coupon, userId);
    await this.applyReward(coupon, userId);

    const newRedeemedBy = [...(row.redeemedBy ?? []), userId];
    const newCurrentRedemptions = (row.currentRedemptions ?? 0) + 1;

    await this.db
      .update(coupons)
      .set({
        redeemedBy: newRedeemedBy,
        currentRedemptions: newCurrentRedemptions,
        updatedAt: new Date(),
      } as Partial<CouponSelect>)
      .where(eq(coupons.id, row.id));

    return this.mapToResponseDto({
      ...coupon,
      redeemedBy: newRedeemedBy,
      currentRedemptions: newCurrentRedemptions,
    });
  }

  private async validateCouponConditions(
    coupon: CouponDto,
    userId: string,
  ): Promise<void> {
    if (coupon.requiredTasks.length === 0) {
      return;
    }

    for (const task of coupon.requiredTasks) {
      switch (task) {
        case RequiredTask.DAILY_LOGIN:
          await this.validateLoginStreak(userId, coupon.loginStreakRequired);
          break;
        case RequiredTask.PLAY_GAMES:
          await this.validateGamesPlayed(userId, coupon.minGamesPlayed);
          break;
        case RequiredTask.MINIMUM_DEPOSIT:
          await this.validateMinimumDeposit(
            userId,
            coupon.minimumDepositAmount,
          );
          break;
        case RequiredTask.REFER_FRIEND:
          await this.validateReferral(userId);
          break;
      }
    }

    if (coupon.claimDelayInHours > 0) {
      await this.validateClaimDelay(coupon, userId);
    }
  }

  private async validateLoginStreak(
    userId: string,
    requiredStreak: number,
  ): Promise<void> {
    const user =
      await this.authenticationRepository.findUserWithProfile(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const lastLogin = user.lastLogin;
    const currentDate = new Date();
    const daysSinceLastLogin = Math.floor(
      (currentDate.getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (daysSinceLastLogin > 1) {
      throw new BadRequestException(
        `Required login streak of ${requiredStreak} days not met`,
      );
    }
  }

  private async validateGamesPlayed(
    userId: string,
    minGames: number,
  ): Promise<void> {
    const betHistory = await this.betHistoryRepository.getUserBetHistory(
      userId,
      1,
      1,
    );
    if (betHistory.total < minGames) {
      throw new BadRequestException(
        `Required minimum games played (${minGames}) not met`,
      );
    }
  }

  private async validateMinimumDeposit(
    userId: string,
    minAmount: number,
  ): Promise<void> {
    const user =
      await this.authenticationRepository.findUserWithProfile(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const transactions =
      await this.transactionRepository.getTransactionsByUser(user);
    const totalDeposits = transactions
      .filter(
        (tx) =>
          tx.type === TransactionType.DEPOSIT &&
          tx.status === TransactionStatus.SETTLED,
      )
      .reduce((sum, tx) => sum + tx.transactionAmount, 0);

    if (totalDeposits < minAmount) {
      throw new BadRequestException(
        `Required minimum deposit amount (${minAmount}) not met`,
      );
    }
  }

  private async validateReferral(userId: string): Promise<void> {
    const stats = await this.referralService.getReferralStats(userId);
    if (stats.totalReferrals === 0) {
      throw new BadRequestException('No successful referrals found');
    }
  }

  private async validateClaimDelay(
    coupon: CouponDto,
    userId: string,
  ): Promise<void> {
    const userDoc =
      await this.authenticationRepository.findUserWithProfile(userId);
    if (!userDoc) {
      throw new NotFoundException('User not found');
    }

    const eligibilityDate = (userDoc as { createdAt?: Date }).createdAt;
    if (!eligibilityDate) {
      throw new BadRequestException('User created date not found');
    }
    const currentDate = new Date();
    const hoursSinceEligibility =
      (currentDate.getTime() - new Date(eligibilityDate).getTime()) /
      (1000 * 60 * 60);

    if (hoursSinceEligibility < coupon.claimDelayInHours) {
      throw new BadRequestException(
        `Coupon can be claimed after ${coupon.claimDelayInHours} hours from account creation`,
      );
    }
  }

  private async applyReward(coupon: CouponDto, userId: string): Promise<void> {
    const user =
      await this.authenticationRepository.findUserWithProfile(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    switch (coupon.rewardType) {
      case RewardType.BONUS_BALANCE:
        break;
      case RewardType.TOKENS:
        break;
      case RewardType.FREE_SPINS:
        throw new BadRequestException('Free spins not implemented yet');
      default:
        throw new BadRequestException('Invalid reward type');
    }
  }

  private mapToResponseDto(coupon: CouponDto): CouponResponseDto {
    return {
      code: coupon.code,
      rewardAmount: coupon.rewardAmount,
      rewardType: coupon.rewardType,
      expiryDate: coupon.expiryDate,
      isActive: coupon.isActive,
      description: coupon.description,
      currentRedemptions: coupon.currentRedemptions,
      maxRedemptions: coupon.maxRedemptions,
    };
  }
}
