import { Inject, Injectable } from '@nestjs/common';
import { DRIZZLE } from 'src/database/constants';
import type { DrizzleDb } from 'src/database/database.module';
import { referrals } from 'src/database/schema/referrals';
import { referralSettings } from 'src/database/schema/referral-settings';
import { profiles } from 'src/database/schema/profiles';
import { eq, and, lt, inArray } from 'drizzle-orm';
import type { ProfileSelect } from 'src/database/schema/profiles';
import type { ReferralSelect, ReferralInsert } from 'src/database/schema/referrals';
import { ReferralStatus } from '../dtos/referral-tracking.dto';

@Injectable()
export class ReferralRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDb) {}

  async findFirstReferralSettings() {
    const [row] = await this.db.select().from(referralSettings).limit(1);
    return row;
  }

  async findProfileByUserId(userId: string) {
    const [row] = await this.db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, userId))
      .limit(1);
    return row;
  }

  async findProfileByReferralCode(code: string) {
    const [row] = await this.db
      .select()
      .from(profiles)
      .where(eq(profiles.referralCode, code))
      .limit(1);
    return row;
  }

  async updateProfileById(
    id: string,
    patch: Partial<ProfileSelect>,
  ): Promise<void> {
    await this.db
      .update(profiles)
      .set({
        ...patch,
        updatedAt: new Date(),
      } as Partial<ProfileSelect>)
      .where(eq(profiles.id, id));
  }

  async insertReferral(values: ReferralInsert): Promise<void> {
    await this.db.insert(referrals).values(values);
  }

  async findPendingReferralByReferred(userId: string) {
    const [row] = await this.db
      .select()
      .from(referrals)
      .where(
        and(
          eq(referrals.referred, userId),
          eq(referrals.status, ReferralStatus.PENDING),
        ),
      )
      .limit(1);
    return row;
  }

  async findReferralsByReferrer(userId: string) {
    return this.db
      .select()
      .from(referrals)
      .where(eq(referrals.referrer, userId));
  }

  async updateReferralById(
    id: string,
    patch: Partial<ReferralSelect>,
  ): Promise<void> {
    await this.db
      .update(referrals)
      .set({
        ...patch,
        updatedAt: new Date(),
      } as Partial<ReferralSelect>)
      .where(eq(referrals.id, id));
  }

  async findExpiredPendingOrActiveReferrals() {
    return this.db
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
  }
}
