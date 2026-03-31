import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotAcceptableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { eq, or } from 'drizzle-orm';
import { sign, type SignOptions } from 'jsonwebtoken';
import {
  UserDto,
  UserProfileResponseDto,
  ActiveSeedPublicDto,
} from 'src/shared/dtos/user.dto';
import { ProfileDto } from 'src/shared/dtos/profile.dto';
import * as bcrypt from 'bcrypt';
import successMessageHelper from 'src/shared/helpers/success-message.helper';
import { ApiResponseMessageDto } from 'src/shared/dtos/ApiResponseMessage.dto';
import { UserRequestI } from 'src/shared/interfaces/userRequest.type';
import { getUserId } from 'src/shared/helpers/user.helper';
import { SeedsRepository } from 'src/core/seeds /repositories/seeds.repository';
import { SeedStatus } from '@blockwinz/shared';
import { CreateSeedRequestDto } from 'src/core/seeds /dtos/seeds.dto';
import { WalletRepository } from 'src/wallet/repositories/wallet.repository';
import { EmailService } from 'src/email/email.service';
import { nanoid, customAlphabet } from 'nanoid';
import { isAfter } from 'date-fns';
import { OTPRepository } from './otp.repository';
import { DRIZZLE } from 'src/database/constants';
import type { DrizzleDb } from 'src/database/database.module';
import { users } from 'src/database/schema/users';
import { profiles } from 'src/database/schema/profiles';
import { waitlists } from 'src/database/schema/waitlists';
import { seeds } from 'src/database/schema/seeds';
import type { UserSelect } from 'src/database/schema/users';
import type { ProfileSelect } from 'src/database/schema/profiles';
import type { SeedSelect } from 'src/database/schema/seeds';
import { randomUUID } from 'crypto';
import { UserAccountEnum } from '@blockwinz/shared';

@Injectable()
export class AuthenticationRepository {
  private readonly logger = new Logger('Authentication Service');

  constructor(
    @Inject(DRIZZLE) private readonly db: DrizzleDb,
    @Inject(ConfigService) public config: ConfigService,
    private seedsService: SeedsRepository,
    private walletRepository: WalletRepository,
    private emailService: EmailService,
    private otpRepository: OTPRepository,
  ) {}

  private toUserDto(
    userRow: UserSelect,
    profileRow?: ProfileSelect | null,
    seedRow?: SeedSelect | null,
  ): UserDto {
    const user: UserDto & { id?: string } = {
      _id: userRow.id,
      id: userRow.id,
      username: userRow.username,
      email: userRow.email ?? '',
      password: userRow.password,
      userAccounts:
        (userRow.userAccounts as UserAccountEnum[]) ??
        (['user'] as UserAccountEnum[]),
      lastLogin: userRow.lastLogin ?? undefined,
      lastLogout: userRow.lastLogout ?? undefined,
      faEnabled: userRow.faEnabled,
      nonce: userRow.nonce,
      futureClientSeed: userRow.futureClientSeed ?? undefined,
      futureServerSeed: userRow.futureServerSeed ?? undefined,
      futureServerSeedHash: userRow.futureServerSeedHash ?? undefined,
      emailVerified: userRow.emailVerified,
      emailVerificationToken: userRow.emailVerificationToken ?? undefined,
      emailVerificationTokenExpires:
        userRow.emailVerificationTokenExpires ?? undefined,
      emailVerificationResendCount:
        userRow.emailVerificationResendCount ?? undefined,
      createdAt: userRow.createdAt ?? undefined,
      updatedAt: userRow.updatedAt ?? undefined,
      profile: profileRow
        ? {
            _id: profileRow.id,
            user: profileRow.userId,
            isHotKeysActive: profileRow.isHotKeysActive,
            canWithdraw: profileRow.canWithdraw,
            isMuted: profileRow.isMuted,
            isBanned: profileRow.isBanned,
            isTurbo: profileRow.isTurbo,
            referralCode: profileRow.referralCode ?? undefined,
            referredBy: profileRow.referredBy ?? undefined,
            referralCount: profileRow.referralCount,
            referralEarnings: profileRow.referralEarnings,
            createdAt: profileRow.createdAt ?? undefined,
            updatedAt: profileRow.updatedAt ?? undefined,
          }
        : (userRow.profileId as unknown as UserDto['profile']),
      activeSeed: seedRow
        ? ({
            _id: seedRow.id,
            id: seedRow.id,
            status: seedRow.status as SeedStatus,
            clientSeed: seedRow.clientSeed,
            serverSeed: seedRow.serverSeed,
            serverSeedHash: seedRow.serverSeedHash,
            deactivatedAt: seedRow.deactivatedAt ?? undefined,
          } as import('src/core/seeds /dtos/seeds.dto').SeedDto)
        : (userRow.activeSeedId as unknown as UserDto['activeSeed']),
    };
    return user;
  }

  /**
   * Maps an internal user DTO to a client-safe response shape.
   */
  private toUserProfileResponse(user: UserDto): UserProfileResponseDto {
    const activeSeed =
      user.activeSeed && typeof user.activeSeed !== 'string'
        ? ({
            _id: user.activeSeed._id,
            id: user.activeSeed.id,
            status: user.activeSeed.status,
            clientSeed: user.activeSeed.clientSeed,
            serverSeedHash: user.activeSeed.serverSeedHash,
            deactivatedAt: user.activeSeed.deactivatedAt,
          } satisfies ActiveSeedPublicDto)
        : user.activeSeed;

    return {
      _id: user._id,
      id: user.id,
      username: user.username,
      email: user.email,
      userAccounts: user.userAccounts,
      lastLogin: user.lastLogin,
      lastLogout: user.lastLogout,
      faEnabled: user.faEnabled,
      nonce: user.nonce,
      futureClientSeed: user.futureClientSeed,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      profile: user.profile,
      activeSeed,
    };
  }

  public async saveUser(
    user: UserDto,
  ): Promise<{ user: UserProfileResponseDto; token: string }> {
    const [existingByUsername] = await this.db
      .select()
      .from(users)
      .where(eq(users.username, user.username))
      .limit(1);
    if (existingByUsername) {
      throw new BadRequestException('Username is already taken');
    }
    if (user?.email) {
      const [existingByEmail] = await this.db
        .select()
        .from(users)
        .where(eq(users.email, user.email))
        .limit(1);
      if (existingByEmail) {
        throw new BadRequestException('Email is already taken');
      }
    }

    const hashedPassword = await bcrypt.hash(user.password, 10);
    const { emailVerificationToken, emailVerificationTokenExpires } =
      this.newVerificationTokenData();

    const { serverSeed, serverHash } =
      this.seedsService.generateServerSeedAndHash();
    const { serverHash: futureServerSeedHash, serverSeed: futureServerSeed } =
      this.seedsService.generateServerSeedAndHash();
    const { clientSeed } = this.seedsService.generateClientSeed();
    const { clientSeed: futureClientSeed } =
      this.seedsService.generateClientSeed();

    const newUserId = randomUUID();

    const { newUserRow, newProfileRow, profileForUser, newSeed } =
      await this.db.transaction(async (rawTx) => {
        const tx = rawTx as unknown as DrizzleDb;

        const [createdProfile] = await tx
          .insert(profiles)
          .values({
            userId: newUserId,
            canWithdraw: true,
            isMuted: false,
            isBanned: false,
            isTurbo: false,
          } as typeof profiles.$inferInsert)
          .returning();
        if (!createdProfile) throw new Error('Failed to create profile');

        if (user.referralCode) {
          const [referrerProfile] = await tx
            .select()
            .from(profiles)
            .where(eq(profiles.referralCode, user.referralCode))
            .limit(1);
          if (referrerProfile) {
            await tx
              .update(profiles)
              .set({
                referredBy: referrerProfile.userId,
                updatedAt: new Date(),
              } as Record<string, unknown>)
              .where(eq(profiles.id, createdProfile.id));
            await tx
              .update(profiles)
              .set({
                referralCount: (referrerProfile.referralCount ?? 0) + 1,
                updatedAt: new Date(),
              } as Record<string, unknown>)
              .where(eq(profiles.id, referrerProfile.id));
          }
        }
        const [profileForUserRow] = await tx
          .select()
          .from(profiles)
          .where(eq(profiles.id, createdProfile.id))
          .limit(1);

        const [createdUser] = await tx
          .insert(users)
          .values({
            id: newUserId,
            username: user.username,
            email: user.email ?? null,
            password: hashedPassword,
            profileId: createdProfile.id,
            lastLogin: new Date(),
            futureClientSeed,
            futureServerSeed,
            futureServerSeedHash,
            nonce: 0,
            emailVerificationToken,
            emailVerificationTokenExpires,
            emailVerificationResendCount: 0,
            emailVerified: false,
          } as typeof users.$inferInsert)
          .returning();
        if (!createdUser) throw new Error('Failed to create user');

        const seed = await this.seedsService.createSeed(
          {
            serverSeed,
            serverSeedHash: serverHash,
            clientSeed,
            status: SeedStatus.ACTIVE,
            user: newUserId,
            deactivatedAt: null,
          } as CreateSeedRequestDto,
          tx,
        );

        await tx
          .update(users)
          .set({
            activeSeedId: seed._id ?? seed.id,
            updatedAt: new Date(),
          } as Record<string, unknown>)
          .where(eq(users.id, newUserId));

        await this.walletRepository.generateWalletAddresses(
          {
            _id: newUserId,
            id: newUserId,
            username: createdUser.username,
            email: createdUser.email ?? '',
            password: '',
            userAccounts: [UserAccountEnum.USER],
          } as UserDto,
          tx,
        );

        return {
          newUserRow: createdUser,
          newProfileRow: createdProfile,
          profileForUser: profileForUserRow ?? createdProfile,
          newSeed: seed,
        };
      });

    if (user.email) {
      try {
        await this.emailService.sendWelcomeEmail(
          user.email,
          user.username,
          emailVerificationToken,
        );
      } catch (error) {
        this.logger.error(
          `Failed to send welcome email to ${user.email}: ${(error as Error).message}`,
        );
      }
    }

    const savedUser = this.toUserDto(
      { ...newUserRow, activeSeedId: newSeed._id as unknown as string },
      profileForUser ?? newProfileRow,
      newSeed as unknown as SeedSelect,
    );
    return {
      user: this.toUserProfileResponse(savedUser),
      token: this.generateToken(savedUser),
    };
  }

  public async findUserAndGenerateToken(
    user: Partial<UserDto>,
  ): Promise<{ token: string }> {
    const [userFound] = await this.db
      .select()
      .from(users)
      .where(
        or(
          eq(users.username, user.username ?? ''),
          eq(users.email, user.username ?? ''),
        ),
      )
      .limit(1);

    if (!userFound) {
      throw new BadRequestException('Invalid Login Credentials');
    }
    const isMatch = await bcrypt.compare(
      user.password ?? '',
      userFound.password,
    );
    if (!isMatch) {
      throw new BadRequestException('Invalid Login Credentials');
    }

    await this.db
      .update(users)
      .set({ lastLogin: new Date(), updatedAt: new Date() } as Record<
        string,
        unknown
      >)
      .where(eq(users.id, userFound.id));

    const [profileRow] = await this.db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, userFound.id))
      .limit(1);
    const userWithProfile = this.toUserDto(userFound, profileRow ?? null, null);
    return { token: this.generateToken(userWithProfile) };
  }

  public async logoutAccount(user: UserRequestI): Promise<{
    message: string;
    status: string;
  }> {
    const userId = getUserId(user);
    await this.db
      .update(users)
      .set({
        lastLogout: new Date(Date.now()),
        updatedAt: new Date(),
      } as Record<string, unknown>)
      .where(eq(users.id, userId));
    return successMessageHelper('Logout Successful');
  }

  /** Short-lived JWT for API + WebSocket (see `JWT_ACCESS_EXPIRES_IN`). */
  createAccessToken(user: UserDto | { _id?: unknown; id?: string }): string {
    return this.generateToken(user);
  }

  private generateToken(user: UserDto | { _id?: unknown; id?: string }) {
    const id = getUserId(user);
    const secret = this.config.get<string>('JWT_SECRET')?.trim();
    if (!secret) {
      throw new InternalServerErrorException('JWT secret is not configured');
    }
    const expiresIn =
      this.config.get<string>('JWT_ACCESS_EXPIRES_IN')?.trim() || '15m';
    return sign(
      { _id: id },
      secret,
      { expiresIn } as SignOptions,
    );
  }

  async changePassword(
    currentPassword: string,
    newPassword: string,
    user: UserRequestI,
  ): Promise<ApiResponseMessageDto> {
    if (!currentPassword) {
      throw new BadRequestException('currentPassword field is Required');
    }
    if (!newPassword) {
      throw new BadRequestException('newPassword is Required');
    }
    const userPassword =
      typeof user.password === 'string'
        ? user.password
        : ((user as { password?: string }).password ?? '');
    const isMatch = await bcrypt.compare(currentPassword, userPassword);
    if (!isMatch) {
      throw new NotAcceptableException('Current Password is incorrect');
    }
    const isSame = await bcrypt.compare(newPassword, userPassword);
    if (isSame) {
      throw new NotAcceptableException(
        'Current Password can not be the same with new password',
      );
    }
    const hashedNew = await bcrypt.hash(newPassword, 10);
    const userId = getUserId(user);
    await this.db
      .update(users)
      .set({
        password: hashedNew,
        updatedAt: new Date(),
      } as Record<string, unknown>)
      .where(eq(users.id, userId));
    await this.logoutAccount(user);
    return successMessageHelper('Password change was successful');
  }

  async findUserWithProfile(id: string): Promise<UserDto> {
    const [userRow] = await this.db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
    if (!userRow) {
      throw new BadRequestException('User not found');
    }
    const [profileRow] = await this.db
      .select()
      .from(profiles)
      .where(eq(profiles.id, userRow.profileId))
      .limit(1);
    let seedRow: SeedSelect | null = null;
    if (userRow.activeSeedId) {
      const [s] = await this.db
        .select()
        .from(seeds)
        .where(eq(seeds.id, userRow.activeSeedId))
        .limit(1);
      seedRow = s ?? null;
    }
    return this.toUserDto(userRow, profileRow ?? null, seedRow);
  }

  /**
   * Loads a user and returns only the fields safe for player-facing responses.
   */
  async findPublicUserWithProfile(id: string): Promise<UserProfileResponseDto> {
    const user = await this.findUserWithProfile(id);
    return this.toUserProfileResponse(user);
  }

  async updatePassword(email: string, newPassword: string): Promise<void> {
    const [userRow] = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    if (!userRow) {
      throw new BadRequestException('User not found');
    }
    const hashed = await bcrypt.hash(newPassword, 10);
    await this.db
      .update(users)
      .set({
        password: hashed,
        updatedAt: new Date(),
      } as Record<string, unknown>)
      .where(eq(users.id, userRow.id));
  }

  async findUserByEmail(email: string): Promise<UserRequestI> {
    const [userRow] = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    if (!userRow) {
      throw new Error('User not found');
    }
    const [profileRow] = await this.db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, userRow.id))
      .limit(1);
    return this.toUserDto(userRow, profileRow ?? null, null) as UserRequestI;
  }

  async joinWaitlist(email: string): Promise<{ message: string }> {
    const [existing] = await this.db
      .select()
      .from(waitlists)
      .where(eq(waitlists.email, email))
      .limit(1);
    if (existing) {
      throw new BadRequestException('Email already registered in waitlist');
    }
    await this.db.insert(waitlists).values({ email });
    return successMessageHelper('Successfully joined the waitlist');
  }

  public async verifyEmail(token: string): Promise<{ message: string }> {
    const [userRow] = await this.db
      .select()
      .from(users)
      .where(eq(users.emailVerificationToken, token))
      .limit(1);
    if (!userRow) {
      throw new BadRequestException('Invalid or expired verification token');
    }
    if (userRow.emailVerified) {
      throw new BadRequestException('Email already verified');
    }
    const expires = userRow.emailVerificationTokenExpires;
    if (expires && isAfter(new Date(), expires)) {
      throw new BadRequestException('Verification token expired');
    }
    await this.db
      .update(users)
      .set({
        emailVerified: true,
        updatedAt: new Date(),
      } as Record<string, unknown>)
      .where(eq(users.id, userRow.id));
    return successMessageHelper('Email verified successfully');
  }

  public async resendVerificationEmail(
    email: string,
  ): Promise<{ message: string }> {
    const [userRow] = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    if (!userRow) {
      throw new BadRequestException('User not found');
    }
    if (userRow.emailVerified) {
      throw new BadRequestException('Email already verified');
    }
    const count = userRow.emailVerificationResendCount ?? 0;
    if (count >= 3) {
      throw new BadRequestException('Verification email resend limit reached');
    }
    const { emailVerificationToken, emailVerificationTokenExpires } =
      this.newVerificationTokenData();
    await this.db
      .update(users)
      .set({
        emailVerificationToken,
        emailVerificationTokenExpires,
        emailVerificationResendCount: count + 1,
        updatedAt: new Date(),
      } as Record<string, unknown>)
      .where(eq(users.id, userRow.id));
    await this.emailService.sendVerificationEmail(
      userRow.email ?? '',
      emailVerificationToken,
    );
    return successMessageHelper('Verification email resent successfully');
  }

  public async changeEmail(
    user: UserRequestI,
    newEmail: string,
  ): Promise<void> {
    const userId = getUserId(user);

    const [emailTaken] = await this.db
      .select()
      .from(users)
      .where(eq(users.email, newEmail))
      .limit(1);

    if (user.email === newEmail) {
      throw new BadRequestException(
        'New email cannot be the same as current email',
      );
    }
    if (emailTaken) {
      throw new BadRequestException('Email already taken');
    }

    const { emailVerificationToken, emailVerificationTokenExpires } =
      this.newVerificationTokenData();
    await this.db
      .update(users)
      .set({
        email: newEmail,
        emailVerificationToken,
        emailVerificationTokenExpires,
        emailVerificationResendCount: 0,
        emailVerified: false,
        updatedAt: new Date(),
      } as Record<string, unknown>)
      .where(eq(users.id, userId));
    await this.emailService.sendVerificationEmail(
      newEmail,
      emailVerificationToken,
    );
  }

  async requestPasswordReset(email: string) {
    const [userRow] = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    if (!userRow) {
      throw new BadRequestException('User not found');
    }
    const otp = customAlphabet('0123456789', 6)();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await this.otpRepository.create(email, otp, expiresAt);
    await this.emailService.sendPasswordResetEmail(email, otp);
    return { message: 'Password reset OTP sent successfully' };
  }

  private newVerificationTokenData = () => {
    const emailVerificationToken = nanoid(12);
    const emailVerificationTokenExpires = new Date(Date.now() + 30 * 60 * 1000);
    return { emailVerificationToken, emailVerificationTokenExpires };
  };
}
