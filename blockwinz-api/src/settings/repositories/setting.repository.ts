import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ProfileDto } from 'src/shared/dtos/profile.dto';
import { DRIZZLE } from 'src/database/constants';
import type { DrizzleDb } from 'src/database/database.module';
import { profiles } from 'src/database/schema/profiles';
import { eq } from 'drizzle-orm';
import type { ProfileSelect } from 'src/database/schema/profiles';

@Injectable()
export class SettingRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDb) {}

  async updateProfileSetting(
    profileId: string,
    update: Partial<Omit<ProfileDto, '_id'>>,
  ): Promise<ProfileDto> {
    const allowedFields: (keyof Omit<ProfileDto, '_id'>)[] = [
      'isMuted',
      'isHotKeysActive',
      'canWithdraw',
      'isBanned',
      'isTurbo',
    ];

    const filteredUpdate: Record<string, boolean> = {};
    for (const key of allowedFields) {
      if (
        key in update &&
        typeof (update as Record<string, unknown>)[key] === 'boolean'
      ) {
        filteredUpdate[key] = (update as Record<string, boolean>)[key];
      }
    }

    if (Object.keys(filteredUpdate).length === 0) {
      const [existing] = await this.db
        .select()
        .from(profiles)
        .where(eq(profiles.id, profileId))
        .limit(1);
      if (!existing) throw new BadRequestException('Failed to update settings');
      return this.profileRowToDto(existing);
    }

    await this.db
      .update(profiles)
      .set({
        ...filteredUpdate,
        updatedAt: new Date(),
      } as Partial<ProfileSelect>)
      .where(eq(profiles.id, profileId));

    const [updated] = await this.db
      .select()
      .from(profiles)
      .where(eq(profiles.id, profileId))
      .limit(1);

    if (!updated) {
      throw new BadRequestException('Failed to update settings');
    }
    return this.profileRowToDto(updated);
  }

  private profileRowToDto(row: ProfileSelect): ProfileDto {
    return {
      _id: row.id as unknown as ProfileDto['_id'],
      user: row.userId as unknown as ProfileDto['user'],
      isHotKeysActive: row.isHotKeysActive,
      canWithdraw: row.canWithdraw,
      isMuted: row.isMuted,
      isBanned: row.isBanned,
      isTurbo: row.isTurbo,
      referralCode: row.referralCode ?? undefined,
      referredBy: row.referredBy ?? undefined,
      referralCount: row.referralCount ?? 0,
      referralEarnings: row.referralEarnings ?? 0,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    } as ProfileDto;
  }
}
