import { Injectable, Inject } from '@nestjs/common';
import { eq, and, gt } from 'drizzle-orm';
import { DRIZZLE } from 'src/database/constants';
import type { DrizzleDb } from 'src/database/database.module';
import { otps } from 'src/database/schema/otps';
import { OtpDto } from '../dtos/otp.dto';

@Injectable()
export class OTPRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDb) {}

  async generateOTP(email: string): Promise<string> {
    const otp = Math.floor(10000000 + Math.random() * 90000000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await this.create(email, otp, expiresAt);
    return otp;
  }

  async verifyOTP(email: string, otp: string): Promise<boolean> {
    const validOTP = await this.findValidOTP(email, otp);
    if (validOTP?._id) {
      await this.markAsUsed(validOTP._id);
      return true;
    }
    return false;
  }

  async create(email: string, otp: string, expiresAt: Date): Promise<OtpDto> {
    const [row] = await this.db
      .insert(otps)
      .values({
        email,
        otp,
        expiresAt,
      })
      .returning();
    return this.toOtpDto(row);
  }

  async findValidOTP(email: string, otp: string): Promise<OtpDto | null> {
    const [row] = await this.db
      .select()
      .from(otps)
      .where(
        and(
          eq(otps.email, email),
          eq(otps.otp, otp),
          eq(otps.isUsed, false),
          gt(otps.expiresAt, new Date()),
        ),
      )
      .limit(1);
    return row ? this.toOtpDto(row) : null;
  }

  async markAsUsed(id: string): Promise<void> {
    await this.db
      .update(otps)
      .set({ isUsed: true } as Record<string, unknown>)
      .where(eq(otps.id, id));
  }

  private toOtpDto(row: {
    id: string;
    email: string;
    otp: string;
    expiresAt: Date;
    isUsed: boolean | null;
    createdAt: Date;
    updatedAt: Date;
  }): OtpDto {
    return {
      _id: row.id,
      email: row.email,
      otp: row.otp,
      expiresAt: row.expiresAt,
      isUsed: row.isUsed ?? false,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}
