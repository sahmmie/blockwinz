import {
  Injectable,
  Inject,
  InternalServerErrorException,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { EmailService } from '../../email/email.service';
import { OTPRepository } from './otp.repository';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import { AdminDto } from 'src/shared/dtos/admin.dto';
import { AdminRole } from '@blockwinz/shared';
import { DRIZZLE } from 'src/database/constants';
import type { DrizzleDb } from 'src/database/database.module';
import { admins } from 'src/database/schema/admins';

@Injectable()
export class AdminAuthRepository {
  constructor(
    @Inject(DRIZZLE) private readonly db: DrizzleDb,
    private emailService: EmailService,
    private otpRepository: OTPRepository,
    private configService: ConfigService,
  ) {}

  async initiateLogin(email: string) {
    const [admin] = await this.db
      .select()
      .from(admins)
      .where(eq(admins.email, email))
      .limit(1);
    if (!admin) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const otp = await this.otpRepository.generateOTP(email);
    await this.emailService.sendOTP(email, otp);
    return { message: 'OTP sent to your email' };
  }

  async verifyOTP(email: string, otp: string) {
    const [admin] = await this.db
      .select()
      .from(admins)
      .where(eq(admins.email, email))
      .limit(1);
    if (!admin) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const isValid = await this.otpRepository.verifyOTP(email, otp);
    if (!isValid) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }
    const payload = {
      sub: admin.id,
      email: admin.email,
      isAdmin: true,
    };
    const secret = this.configService.get<string>('JWT_SECRET')?.trim();
    if (!secret) {
      throw new InternalServerErrorException('JWT secret is not configured');
    }
    const token = jwt.sign(
      payload,
      secret,
      { expiresIn: '1d' },
    );
    return { access_token: token };
  }

  async createAdmin(email: string, role: AdminRole): Promise<AdminDto> {
    const [existing] = await this.db
      .select()
      .from(admins)
      .where(eq(admins.email, email))
      .limit(1);
    if (existing) {
      throw new ConflictException('Email already exists');
    }
    const [admin] = await this.db
      .insert(admins)
      .values({
        email,
        role: role as 'super_admin' | 'admin' | 'moderator',
        isVerified: true,
        isActive: true,
        createdBy: 'system',
        updatedBy: 'system',
        lastLogin: new Date(),
        failedLoginAttempts: 0,
        twoFactorEnabled: false,
      } as typeof admins.$inferInsert)
      .returning();
    if (!admin) throw new Error('Failed to create admin');
    const otp = await this.otpRepository.generateOTP(email);
    await this.emailService.sendOTP(email, otp);
    return this.toAdminDto(admin);
  }

  async logout(adminId: string) {
    await this.db
      .update(admins)
      .set({ lastLogout: new Date() } as Record<string, unknown>)
      .where(eq(admins.id, adminId));
    return { message: 'Logout successful' };
  }

  async findAdminById(id: string): Promise<AdminDto | null> {
    const [row] = await this.db
      .select()
      .from(admins)
      .where(eq(admins.id, id))
      .limit(1);
    return row ? this.toAdminDto(row) : null;
  }

  private toAdminDto(row: typeof admins.$inferSelect): AdminDto {
    return {
      _id: row.id,
      email: row.email,
      isVerified: row.isVerified ?? false,
      isActive: row.isActive ?? true,
      lastLogout: row.lastLogout ?? (null as unknown as Date),
      role: row.role as AdminRole,
      lastLogin: row.lastLogin ?? (null as unknown as Date),
      lastLoginIP: row.lastLoginIP ?? '',
      createdBy: row.createdBy ?? '',
      updatedBy: row.updatedBy ?? '',
      twoFactorEnabled: row.twoFactorEnabled ?? false,
      twoFactorSecret: row.twoFactorSecret ?? '',
      failedLoginAttempts: row.failedLoginAttempts ?? 0,
      lockUntil: row.lockUntil ?? (null as unknown as Date),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}
