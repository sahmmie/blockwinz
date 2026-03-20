import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { eq, and, desc, sql } from 'drizzle-orm';
import { UserDto } from 'src/shared/dtos/user.dto';
import { getUserId } from 'src/shared/helpers/user.helper';
import { TransactionDto } from '../dtos/transaction.dto';
import {
  TransactionStatus,
  TransactionType,
} from '@blockwinz/shared';
import { DbGameSchema } from '@blockwinz/shared';
import { CHAIN, Currency } from '@blockwinz/shared';
import { PaginatedDataI } from 'src/shared/interfaces/pagination.interface';
import { DRIZZLE } from 'src/database/constants';
import type { DrizzleDb } from 'src/database/database.module';
import { transactions } from 'src/database/schema/transactions';

@Injectable()
export class TransactionRepository {
  private readonly logger = new Logger('Transaction Repository');

  constructor(
    @Inject(DRIZZLE) private readonly db: DrizzleDb,
    @Inject(ConfigService) public config: ConfigService,
  ) {}

  private getDb(tx?: DrizzleDb): DrizzleDb {
    return tx ?? this.db;
  }

  public async getTransactionById(id: string): Promise<TransactionDto | null> {
    const idStr = String(id);
    const [row] = await this.db
      .select()
      .from(transactions)
      .where(eq(transactions.id, idStr))
      .limit(1);
    return row ? this.toTransactionDto(row) : null;
  }

  public async getTransactionsByType(type: string): Promise<TransactionDto[]> {
    const rows = await this.db
      .select()
      .from(transactions)
      .where(eq(transactions.type, type));
    return rows.map((r) => this.toTransactionDto(r));
  }

  public async getTransactionsByGameAndType(
    gameId: string,
    type: TransactionType,
    tx?: DrizzleDb,
  ): Promise<TransactionDto | null> {
    const db = this.getDb(tx);
    const [row] = await db
      .select()
      .from(transactions)
      .where(and(eq(transactions.gameId, gameId), eq(transactions.type, type)))
      .limit(1);
    return row ? this.toTransactionDto(row) : null;
  }

  public async getTransactionsByIsOnChain(
    isOnChain: boolean,
  ): Promise<TransactionDto[]> {
    const rows = await this.db
      .select()
      .from(transactions)
      .where(eq(transactions.onChain, isOnChain));
    return rows.map((r) => this.toTransactionDto(r));
  }

  public async createTransaction(
    user: UserDto,
    transactionAmount: number,
    gameId: string | null,
    gameModel: DbGameSchema | null | undefined,
    transactionType: TransactionType,
    status: TransactionStatus,
    fulfillmentDate: Date | null,
    chain: CHAIN,
    currency: Currency,
    metadata?: Record<string, string>,
    withdrawalId?: string | null,
    onChain?: boolean,
    tx?: DrizzleDb,
  ): Promise<TransactionDto> {
    const db = this.getDb(tx);
    const userId = getUserId(user);
    const gameIdStr = gameId != null ? String(gameId) : null;
    const [row] = await db
      .insert(transactions)
      .values({
        userId,
        type: transactionType,
        status,
        fulfillmentDate,
        transactionAmount: String(transactionAmount),
        gameId: gameIdStr,
        gameModel: gameModel ?? null,
        withdrawalId: withdrawalId ?? null,
        metadata: metadata ?? null,
        onChain: onChain ?? false,
        chain,
        currency,
      } as typeof transactions.$inferInsert)
      .returning();
    if (!row) throw new Error('Failed to create transaction');
    this.logger.log(
      `Transaction created for user ${userId} with amount ${transactionAmount} in game ${gameId} of type ${transactionType}`,
    );
    return this.toTransactionDto(row);
  }

  public async updateTransaction(
    transaction: TransactionDto,
    tx?: DrizzleDb,
  ): Promise<TransactionDto> {
    const db = this.getDb(tx);
    const t = transaction as unknown as { _id?: string; id?: string };
    const id = t._id ?? t.id;
    if (!id) throw new BadRequestException('Transaction id required');
    const idStr = String(id);
    const [existing] = await db
      .select()
      .from(transactions)
      .where(eq(transactions.id, idStr))
      .limit(1);
    if (!existing) {
      throw new BadRequestException('Transaction does not exist');
    }
    const [updated] = await db
      .update(transactions)
      .set({
        status: transaction.status,
        fulfillmentDate: transaction.fulfillmentDate,
        txid: transaction.txid,
        metadata: transaction.metadata,
        onChain: transaction.onChain,
      } as Record<string, unknown>)
      .where(eq(transactions.id, idStr))
      .returning();
    if (!updated) throw new Error('Update failed');
    return this.toTransactionDto(updated);
  }

  public async getTransactions(
    user: UserDto,
    type: TransactionType,
    limit: number,
    page: number,
  ): Promise<PaginatedDataI<TransactionDto>> {
    if (limit < 1 || limit > 100) {
      throw new BadRequestException('Limit must be between 1 and 100');
    }
    if (page < 1) {
      throw new BadRequestException('Page must be greater than 0');
    }
    if (!Object.values(TransactionType).includes(type)) {
      throw new BadRequestException('Invalid transaction type');
    }
    const userId = getUserId(user);
    const offset = limit * (page - 1);
    const rows = await this.db
      .select()
      .from(transactions)
      .where(and(eq(transactions.userId, userId), eq(transactions.type, type)))
      .orderBy(desc(transactions.createdAt))
      .limit(limit)
      .offset(offset);
    const [{ count }] = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(transactions)
      .where(and(eq(transactions.userId, userId), eq(transactions.type, type)));
    const total = Number(count ?? 0);
    return {
      result: rows.map((r) => this.toTransactionDto(r)),
      total,
      page,
      pages: Array.from({ length: Math.ceil(total / limit) }, (_, i) => i + 1),
      sort: 'createdAt',
    };
  }

  public async getTransactionsByUser(user: UserDto): Promise<TransactionDto[]> {
    const userId = getUserId(user);
    const rows = await this.db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.createdAt));
    return rows.map((r) => this.toTransactionDto(r));
  }

  private toTransactionDto(
    row: typeof transactions.$inferSelect,
  ): TransactionDto {
    return {
      _id: row.id,
      user: row.userId,
      type: row.type as TransactionType,
      status: row.status as TransactionStatus,
      transactionAmount: Number(row.transactionAmount),
      fulfillmentDate: row.fulfillmentDate ?? undefined,
      game: row.gameId ?? undefined,
      gameModel: row.gameModel as DbGameSchema,
      metadata: row.metadata as Record<string, string>,
      onChain: row.onChain ?? false,
      chain: row.chain as CHAIN,
      currency: row.currency as Currency,
      txid: row.txid ?? undefined,
      withdrawal: row.withdrawalId ?? undefined,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}
