import {
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { and, eq, gte, sql, desc, asc } from 'drizzle-orm';
import { UserRequestI } from 'src/shared/interfaces/userRequest.type';
import { getUserId } from 'src/shared/helpers/user.helper';
import { CHAIN, Currency } from 'src/shared/enums/currencies.enum';
import { WithdrawalStatus } from 'src/shared/enums/withdrawalStatus.enum';
import { WithdrawalDto } from '../dtos/withdrawal.dto';
import { currencyData } from 'src/shared/constants/currency.constant';
import { WalletRepository } from 'src/wallet/repositories/wallet.repository';
import {
  TransactionStatus,
  TransactionType,
} from 'src/shared/enums/transaction.enums';
import { TransactionRepository } from 'src/transaction/repositories/transaction.repository';
import { ProfileDto } from 'src/shared/dtos/profile.dto';
import { ApprovalType } from 'src/shared/enums/approvalType.enum';
import { WithdrawalQueueRepository } from 'src/core/queue/repositories/withdrawalQueue.repository';
import { DRIZZLE } from 'src/database/constants';
import type { DrizzleDb } from 'src/database/database.module';
import { withdrawals } from 'src/database/schema/withdrawals';
import type { WithdrawalSelect } from 'src/database/schema/withdrawals';

@Injectable()
export class WithdrawalRepository {
  private readonly logger = new Logger(WithdrawalRepository.name);

  constructor(
    @Inject(DRIZZLE) private readonly db: DrizzleDb,
    private walletRepository: WalletRepository,
    private transactionRepository: TransactionRepository,
    private readonly withdrawalQueueRepository: WithdrawalQueueRepository,
  ) {}

  private rowToDto(row: WithdrawalSelect): WithdrawalDto {
    return {
      _id: row.id,
      userId: row.userId,
      amount: Number(row.amount),
      currency: row.currency as Currency,
      destinationAddress: row.destinationAddress,
      requestId: row.requestId,
      status: row.status as WithdrawalStatus,
      approvedBy: row.approvedById ?? undefined,
      approvedAt: row.approvedAt ?? undefined,
      rejectedBy: row.rejectedById ?? undefined,
      rejectedAt: row.rejectedAt ?? undefined,
      rejectionReason: row.rejectionReason ?? undefined,
      processedAt: row.processedAt as unknown as Date,
      transactionHash: row.transactionHash ?? undefined,
      approvalType: (row.approvalType as ApprovalType) ?? ApprovalType.MANUAL,
      error: row.error ?? undefined,
    };
  }

  /**
   * Creates a withdrawal request, transaction record, and locks funds in a single Postgres transaction.
   */
  async createWithdrawal(
    user: UserRequestI,
    amount: number,
    currency: Currency,
    destinationAddress: string,
    requestId: string,
  ): Promise<WithdrawalDto> {
    const maxWithdrawalsPerDay = 100;
    const userId = getUserId(user);

    return await this.db.transaction(async (tx) => {
      const [existing] = await tx
        .select()
        .from(withdrawals)
        .where(eq(withdrawals.requestId, requestId))
        .limit(1);
      if (existing) {
        return this.rowToDto(existing);
      }

      const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const [{ count }] = await tx
        .select({
          count: sql<number>`count(*)::int`,
        })
        .from(withdrawals)
        .where(
          and(
            eq(withdrawals.userId, userId),
            gte(withdrawals.createdAt, since),
          ),
        );
      if (Number(count ?? 0) >= maxWithdrawalsPerDay) {
        throw new BadRequestException('Daily withdrawal limit exceeded');
      }

      if (Number(amount) < currencyData[currency].minWithdrawalAmount) {
        throw new BadRequestException(
          `Minimum withdrawal amount is ${currencyData[currency].minWithdrawalAmount}`,
        );
      }

      const approvalType = (await this.canAutoApproveWithdrawal(
        user,
        amount,
        currency,
      ))
        ? ApprovalType.AUTOMATIC
        : ApprovalType.MANUAL;

      await this.walletRepository.checkPlayerBalance(
        user,
        amount,
        currency,
        tx as unknown as DrizzleDb,
      );

      const [withdrawalRow] = await tx
        .insert(withdrawals)
        .values({
          userId,
          amount: String(amount),
          currency,
          destinationAddress,
          requestId,
          status: WithdrawalStatus.PENDING,
          approvalType,
        } as typeof withdrawals.$inferInsert)
        .returning();
      if (!withdrawalRow) throw new Error('Failed to create withdrawal');

      const transaction = await this.transactionRepository.createTransaction(
        user,
        amount,
        null,
        undefined,
        TransactionType.WITHDRAW,
        TransactionStatus.PENDING,
        null,
        CHAIN.SOLANA,
        currency,
        { destinationAddress, requestId },
        withdrawalRow.id,
        false,
        tx as unknown as DrizzleDb,
      );

      await this.walletRepository.lockWithdrawalFunds(
        user,
        amount,
        currency,
        tx as unknown as DrizzleDb,
      );

      if (withdrawalRow.approvalType === ApprovalType.AUTOMATIC) {
        await this.withdrawalQueueRepository.queueWithdrawal(
          user,
          transaction,
          this.rowToDto(withdrawalRow),
        );
      }

      return this.rowToDto(withdrawalRow);
    });
  }

  async getWithdrawalStatus(requestId: string): Promise<WithdrawalDto> {
    const [row] = await this.db
      .select()
      .from(withdrawals)
      .where(eq(withdrawals.requestId, requestId))
      .limit(1);
    if (!row) {
      throw new NotFoundException('Withdrawal not found');
    }
    return this.rowToDto(row);
  }

  async getUserWithdrawals(userId: string): Promise<WithdrawalDto[]> {
    const id = String(userId);
    const rows = await this.db
      .select()
      .from(withdrawals)
      .where(eq(withdrawals.userId, id))
      .orderBy(desc(withdrawals.createdAt))
      .limit(10);
    return rows.map((r) => this.rowToDto(r));
  }

  async getPendingWithdrawals(): Promise<WithdrawalDto[]> {
    const rows = await this.db
      .select()
      .from(withdrawals)
      .where(eq(withdrawals.status, WithdrawalStatus.PENDING))
      .orderBy(asc(withdrawals.createdAt));
    return rows.map((r) => this.rowToDto(r));
  }

  async updateWithdrawalStatus(
    requestId: string,
    status: WithdrawalStatus,
    adminId?: string,
    reason?: string,
  ): Promise<WithdrawalDto> {
    const [row] = await this.db
      .select()
      .from(withdrawals)
      .where(eq(withdrawals.requestId, requestId))
      .limit(1);
    if (!row) {
      throw new NotFoundException('Withdrawal not found');
    }

    const update: Record<string, unknown> = {
      status,
      updatedAt: new Date(),
    };
    if (status === WithdrawalStatus.APPROVED) {
      update.approvedById = adminId != null ? String(adminId) : null;
      update.approvedAt = new Date();
    } else if (status === WithdrawalStatus.REJECTED) {
      update.rejectedById = adminId != null ? String(adminId) : null;
      update.rejectedAt = new Date();
      update.rejectionReason = reason ?? null;
    }

    const [updated] = await this.db
      .update(withdrawals)
      .set(update)
      .where(eq(withdrawals.id, row.id))
      .returning();
    if (!updated) throw new Error('Update failed');
    return this.rowToDto(updated);
  }

  /**
   * Update withdrawal by requestId (used by queue processor).
   */
  async updateWithdrawal(
    requestId: string,
    data: {
      status?: WithdrawalStatus;
      transactionHash?: string | null;
      processedAt?: Date | null;
      error?: string | null;
    },
  ): Promise<WithdrawalDto> {
    const [row] = await this.db
      .select()
      .from(withdrawals)
      .where(eq(withdrawals.requestId, requestId))
      .limit(1);
    if (!row) {
      throw new NotFoundException('Withdrawal not found');
    }
    const update: Record<string, unknown> = {
      updatedAt: new Date(),
      ...(data.status !== undefined && { status: data.status }),
      ...(data.transactionHash !== undefined && {
        transactionHash: data.transactionHash,
      }),
      ...(data.processedAt !== undefined && {
        processedAt: data.processedAt,
      }),
      ...(data.error !== undefined && { error: data.error }),
    };
    const [updated] = await this.db
      .update(withdrawals)
      .set(update)
      .where(eq(withdrawals.id, row.id))
      .returning();
    if (!updated) throw new Error('Update failed');
    return this.rowToDto(updated);
  }

  async canAutoApproveWithdrawal(
    user: UserRequestI,
    amount: number,
    currency: Currency,
  ): Promise<boolean> {
    const isSmallAmount = amount <= currencyData[currency].minWithdrawalAmount;
    const userIsLowRisk = true;
    const profile = user.profile as ProfileDto | undefined;
    if (!profile?.canWithdraw) {
      throw new BadRequestException(
        'Failed to process withdrawal: Please contact support to enable withdrawals',
      );
    }
    if (!user.emailVerified) {
      throw new BadRequestException(
        'Please verify email to enable withdrawals',
      );
    }
    if (!isSmallAmount && !userIsLowRisk) {
      return false;
    }
    return true;
  }
}
