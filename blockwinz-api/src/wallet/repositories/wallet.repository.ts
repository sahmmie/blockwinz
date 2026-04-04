import {
  BadRequestException,
  ForbiddenException,
  forwardRef,
  Inject,
  InternalServerErrorException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { and, eq, sql } from 'drizzle-orm';
import { UserDto } from 'src/shared/dtos/user.dto';
import { UserRequestI } from 'src/shared/interfaces/userRequest.type';
import { getUserId, getWalletId } from 'src/shared/helpers/user.helper';
import { WalletDto, PublicWalletDto } from '../dtos/wallet.dto';
import { CHAIN, Currency } from '@blockwinz/shared';
import { SolWalletRepository } from './solWallet.repository';
import { BwzWalletRepository } from './bwzWallet.repository';
import { balanceIsSufficient } from 'src/shared/helpers/utils-functions.helper';
import { SolanaCoreRepository } from 'src/core/solanaCore/repositories/solanaCore.repository';
import { WalletQueueRepository } from 'src/core/queue/repositories/walletQueue.repository';
import { CreditFreeBwzDtoReq } from '../dtos/send-bwz.dto';
import { DRIZZLE } from 'src/database/constants';
import type { DrizzleDb } from 'src/database/database.module';
import { wallets } from 'src/database/schema/wallets';
import { users } from 'src/database/schema/users';
import {
  creditFreeBwz,
  type CreditFreeBwzInsert,
} from 'src/database/schema/credit-free-bwz';

@Injectable()
export class WalletRepository {
  private readonly logger = new Logger(WalletRepository.name);

  constructor(
    @Inject(DRIZZLE) private readonly db: DrizzleDb,
    @Inject(ConfigService) public config: ConfigService,
    private solWalletRepository: SolWalletRepository,
    private bwzWalletRepository: BwzWalletRepository,
    private solanaCoreRepository: SolanaCoreRepository,
    @Inject(forwardRef(() => WalletQueueRepository))
    private walletQueueRepository: WalletQueueRepository,
  ) {}

  private rowToWalletDto(row: typeof wallets.$inferSelect): WalletDto {
    const app = Number(row.appBalance);
    const locked = Number(row.lockedInBets);
    const pending = Number(row.pendingWithdrawal);
    return {
      _id: row.id,
      user: row.userId,
      address: row.address,
      privateKey: row.privateKey,
      publicKey: row.publicKey,
      currency: row.currency as Currency,
      chain: row.chain as CHAIN,
      onChainBalance: Number(row.onChainBalance),
      appBalance: app,
      pendingWithdrawal: pending,
      lockedInBets: locked,
      availableBalance: app - locked - pending,
      syncedAt: row.syncedAt,
    };
  }

  public async generateWalletAddresses(
    user: UserDto,
    tx?: DrizzleDb,
  ): Promise<WalletDto[]> {
    const solWallet =
      await this.solWalletRepository.generateSolWalletAddress(user, tx);
    const bwzWallet =
      await this.bwzWalletRepository.generateBwzWalletAddress(user, tx);
    return [solWallet, bwzWallet];
  }

  public async getWalletAddresses(
    user: UserDto,
  ): Promise<PublicWalletDto[]> {
    const addresses = await Promise.all([
      this.solWalletRepository.getSolWalletAddress(user),
      this.bwzWalletRepository.getBwzWalletAddress(user),
    ]);
    return this.convertToPublicWallet(addresses);
  }

  public async getWalletBalances(
    user: UserRequestI,
    forceRefresh?: boolean,
  ): Promise<PublicWalletDto[]> {
    if (!forceRefresh) {
      await this.walletQueueRepository.queueUpdateWallet(user);
    }
    const balances = await Promise.all([
      this.solWalletRepository.getSolWalletBalance(user, forceRefresh),
      this.bwzWalletRepository.getBwzWalletBalance(user, forceRefresh),
    ]);
    return this.convertToPublicWallet(balances);
  }

  /** Strips internal-only wallet secrets before returning player-facing wallet data. */
  public convertToPublicWallet(wallet: WalletDto[]): PublicWalletDto[] {
    return wallet.map((w) => ({
      _id: w._id,
      user: w.user,
      currency: w.currency,
      chain: w.chain,
      availableBalance: w.availableBalance,
      address: w.address,
      onChainBalance: w.onChainBalance,
    }));
  }

  public async checkPlayerBalance(
    user: UserRequestI | UserDto,
    betAmount: number,
    currency: Currency,
    tx?: DrizzleDb,
  ): Promise<WalletDto> {
    if (currency === Currency.SOL) {
      const solBalance = await this.solWalletRepository.getSolWalletBalance(
        user,
        false,
        tx,
      );
      return this.playerBalanceIsSufficient(betAmount, solBalance);
    }
    if (currency === Currency.BWZ) {
      const bwzBalance = await this.bwzWalletRepository.getBwzWalletBalance(
        user,
        false,
        tx,
      );
      return this.playerBalanceIsSufficient(betAmount, bwzBalance);
    }
    throw new NotFoundException('Currency not found');
  }

  public playerBalanceIsSufficient(
    betAmount: number,
    wallet: WalletDto,
  ): WalletDto {
    if (!balanceIsSufficient(betAmount, wallet.availableBalance ?? 0)) {
      throw new BadRequestException('Insufficient balance');
    }
    return wallet;
  }

  /**
   * Whether the given Solana address matches any custodial player wallet row (BWZ/SOL rows share the same on-chain address per user).
   *
   * @param destinationAddress Raw destination from the client (trimmed before lookup).
   * @param tx Optional Drizzle transaction (e.g. withdrawal creation).
   * @returns True when the address is a registered BlockWinz custodial deposit address.
   */
  public async isPlayerCustodialWalletAddress(
    destinationAddress: string,
    tx?: DrizzleDb,
  ): Promise<boolean> {
    const normalized = destinationAddress.trim();
    if (!normalized) {
      return false;
    }
    const db = tx ?? this.db;
    const [row] = await db
      .select({ id: wallets.id })
      .from(wallets)
      .where(eq(wallets.address, normalized))
      .limit(1);
    return row != null;
  }

  public async creditPlayer(
    user: UserRequestI,
    amount: number,
    currency: Currency,
    tx?: DrizzleDb,
  ): Promise<WalletDto> {
    if (amount < 0) {
      throw new BadRequestException('Invalid amount');
    }
    const wallet = await this.findWalletByUserAndCurrency(
      getUserId(user),
      currency,
      tx,
    );
    return this.updateAppBalance(wallet, amount, tx);
  }

  public async debitPlayer(
    user: UserRequestI,
    amount: number,
    currency: Currency,
    tx?: DrizzleDb,
  ): Promise<WalletDto> {
    const wallet = await this.findWalletByUserAndCurrency(
      getUserId(user),
      currency,
      tx,
    );
    if (!balanceIsSufficient(amount, wallet.availableBalance ?? 0)) {
      throw new BadRequestException('Insufficient funds');
    }
    return this.updateAppBalance(wallet, -amount, tx);
  }

  /**
   * Withdraw funds from a user's wallet to an external address.
   * Ensure appBalance is debited before calling this method.
   */
  public async withdrawFunds(
    user: UserRequestI,
    amount: number,
    currency: Currency,
    destinationAddress: string,
    tx?: DrizzleDb,
  ): Promise<string> {
    const wallet = await this.findWalletByUserAndCurrency(
      getUserId(user),
      currency,
      tx,
    );

    if ((wallet.pendingWithdrawal ?? 0) < amount) {
      this.logger.error(
        `Insufficient withdrawal funds: amount=${amount}, pendingWithdrawal=${wallet.pendingWithdrawal}`,
      );
      throw new BadRequestException('Insufficient funds to withdraw');
    }

    const signature = await this.withdrawToChain(
      currency,
      destinationAddress,
      amount,
    );

    return signature;
  }

  /**
   * Lock funds in preparation for a withdrawal request.
   */
  public async lockWithdrawalFunds(
    user: UserDto,
    amount: number,
    currency: Currency,
    tx?: DrizzleDb,
  ): Promise<void> {
    const db = tx ?? this.db;
    const [updated] = await db
      .update(wallets)
      .set({
        pendingWithdrawal: sql`${wallets.pendingWithdrawal} + ${amount}`,
        updatedAt: new Date(),
      } as Record<string, unknown>)
      .where(
        and(
          eq(wallets.userId, getUserId(user)),
          eq(wallets.currency, currency),
          sql`(${wallets.appBalance} - ${wallets.pendingWithdrawal} - ${wallets.lockedInBets}) >= ${amount}`,
        ),
      )
      .returning({ id: wallets.id });
    if (!updated) {
      throw new BadRequestException('Insufficient funds');
    }
  }

  /**
   * Release previously locked withdrawal funds.
   */
  public async releaseWithdrawalFunds(
    user: UserDto,
    amount: number,
    currency: Currency,
    tx?: DrizzleDb,
  ): Promise<void> {
    const db = tx ?? this.db;
    const [updated] = await db
      .update(wallets)
      .set({
        pendingWithdrawal: sql`${wallets.pendingWithdrawal} - ${amount}`,
        updatedAt: new Date(),
      } as Record<string, unknown>)
      .where(
        and(
          eq(wallets.userId, getUserId(user)),
          eq(wallets.currency, currency),
          sql`${wallets.pendingWithdrawal} >= ${amount}`,
        ),
      )
      .returning({ id: wallets.id });
    if (!updated) {
      throw new BadRequestException('No reserved withdrawal funds to release');
    }
  }

  /**
   * Lock funds when a user places a bet.
   */
  public async lockBetFunds(
    user: UserDto,
    amount: number,
    currency: Currency,
    tx?: DrizzleDb,
  ): Promise<void> {
    const db = tx ?? this.db;
    const [updated] = await db
      .update(wallets)
      .set({
        lockedInBets: sql`${wallets.lockedInBets} + ${amount}`,
        updatedAt: new Date(),
      } as Record<string, unknown>)
      .where(
        and(
          eq(wallets.userId, getUserId(user)),
          eq(wallets.currency, currency),
          sql`(${wallets.appBalance} - ${wallets.pendingWithdrawal} - ${wallets.lockedInBets}) >= ${amount}`,
        ),
      )
      .returning({ id: wallets.id });
    if (!updated) {
      throw new BadRequestException('Insufficient funds');
    }
  }

  /**
   * Release previously locked funds after a bet resolves.
   */
  public async releaseBetFunds(
    user: UserDto,
    amount: number,
    currency: Currency,
    tx?: DrizzleDb,
  ): Promise<void> {
    const db = tx ?? this.db;
    const [updated] = await db
      .update(wallets)
      .set({
        lockedInBets: sql`${wallets.lockedInBets} - ${amount}`,
        updatedAt: new Date(),
      } as Record<string, unknown>)
      .where(
        and(
          eq(wallets.userId, getUserId(user)),
          eq(wallets.currency, currency),
          sql`${wallets.lockedInBets} >= ${amount}`,
        ),
      )
      .returning({ id: wallets.id });
    if (!updated) {
      throw new BadRequestException('No reserved bet funds to release');
    }
  }

  /**
   * Run reconciliation check (scheduled job).
   */
  public async runReconciliation(currency: Currency): Promise<void> {
    const walletRows = await this.db
      .select()
      .from(wallets)
      .where(eq(wallets.currency, currency));
    const threshold = 0.0001;

    for (const row of walletRows) {
      try {
        const userLike = { _id: row.userId, id: row.userId };
        const balances = await this.getWalletBalances(
          userLike as UserRequestI,
          true,
        );
        const onChainBalance =
          balances.find((w) => w.currency === row.currency)?.onChainBalance ??
          0;

        const expectedBalance =
          Number(row.appBalance) + Number(row.pendingWithdrawal);

        if (Math.abs((onChainBalance ?? 0) - expectedBalance) > threshold) {
          this.logger.error(`Balance mismatch for wallet ${row.id}`);
        }
      } catch (err) {
        this.logger.error(`Reconciliation failed for wallet ${row.id}:`, err);
      }
    }
  }

  /**
   * Sweep funds from a player's wallet to the company treasury on-chain.
   */
  public async sweepToTreasuryFromPlayer(
    player: UserRequestI,
    amount: number,
    currency: Currency,
  ): Promise<string> {
    const [row] = await this.db
      .select({ privateKey: wallets.privateKey })
      .from(wallets)
      .where(
        and(
          eq(wallets.userId, getUserId(player)),
          eq(wallets.chain, CHAIN.SOLANA),
          eq(wallets.currency, currency),
        ),
      )
      .limit(1);

    if (!row) {
      throw new NotFoundException('Wallet not found');
    }

    if (currency === Currency.SOL) {
      return this.solWalletRepository.debitPlayerSol(row.privateKey, amount);
    }
    if (currency === Currency.BWZ) {
      return this.bwzWalletRepository.debitPlayerBwz(row.privateKey, amount);
    }
    throw new BadRequestException('Debit player error: Invalid currency');
  }

  private async withdrawToChain(
    currency: Currency,
    destinationAddress: string,
    amount: number,
  ): Promise<string> {
    this.solanaCoreRepository.isValidSolanaAddress(destinationAddress);
    if (currency === Currency.SOL) {
      return await this.solWalletRepository.creditPlayerSol(
        destinationAddress,
        amount,
      );
    }
    if (currency === Currency.BWZ) {
      return await this.bwzWalletRepository.creditPlayerBwz(
        destinationAddress,
        amount,
      );
    }
    throw new BadRequestException('Credit player error: Invalid currency');
  }

  /**
   * Update app balance (atomic). Ensures app balance never goes negative.
   */
  private async updateAppBalance(
    wallet: WalletDto,
    amount: number,
    tx?: DrizzleDb,
  ): Promise<WalletDto> {
    const db = tx ?? this.db;
    const walletId = getWalletId(wallet);
    if (!walletId) throw new BadRequestException('Wallet id required');

    const [updated] = await db
      .update(wallets)
      .set({
        appBalance: sql`${wallets.appBalance} + ${amount}`,
        updatedAt: new Date(),
      } as Record<string, unknown>)
      .where(
        and(
          eq(wallets.id, walletId),
          sql`(${wallets.appBalance} + ${amount}) >= 0`,
        ),
      )
      .returning();

    if (!updated) {
      throw new BadRequestException('App balance update failed (possibly negative)');
    }
    return this.rowToWalletDto(updated);
  }

  private async findWalletByUserAndCurrency(
    userId: string,
    currency: Currency,
    tx?: DrizzleDb,
  ): Promise<WalletDto> {
    const db = tx ?? this.db;
    const [row] = await db
      .select()
      .from(wallets)
      .where(and(eq(wallets.userId, userId), eq(wallets.currency, currency)))
      .limit(1);

    if (!row) {
      throw new NotFoundException('Wallet not found');
    }
    return this.rowToWalletDto(row);
  }

  public async sendBwzToUser(
    sendBwzDto: CreditFreeBwzDtoReq,
  ): Promise<{ success: boolean; signature: string }> {
    const MAX_BWZ = 10000;
    const faucetEnabled = this.config.get<string>('ENABLE_TESTNET_BWZ_FAUCET');

    if (faucetEnabled !== 'true') {
      throw new ForbiddenException('BWZ faucet is disabled');
    }

    if (process.env.NODE_ENV === 'production') {
      throw new ForbiddenException(
        'This endpoint is not available in production',
      );
    }

    if (this.config.get('SOLANA_NETWORK') !== 'testnet') {
      throw new BadRequestException(
        'This endpoint is only available on testnet',
      );
    }

    const [userRow] = await this.db
      .select()
      .from(users)
      .where(eq(users.username, sendBwzDto.username))
      .limit(1);

    if (!userRow) {
      throw new NotFoundException('User not found');
    }

    const requestedAddr = sendBwzDto.walletAddress.trim();
    const [bwzWallet] = await this.db
      .select({ address: wallets.address })
      .from(wallets)
      .where(
        and(
          eq(wallets.userId, userRow.id),
          eq(wallets.currency, Currency.BWZ),
          eq(wallets.chain, CHAIN.SOLANA),
        ),
      )
      .limit(1);

    if (!bwzWallet || bwzWallet.address.trim() !== requestedAddr) {
      throw new BadRequestException(
        'walletAddress must match the user’s registered BWZ wallet address',
      );
    }

    const [existing] = await this.db
      .select()
      .from(creditFreeBwz)
      .where(eq(creditFreeBwz.username, sendBwzDto.username))
      .limit(1);

    let creditId: string;
    let totalSent: number;
    let sendHistory: Array<{
      amount: number;
      timestamp: string;
      signature: string;
      walletAddress: string;
    }>;

    if (existing) {
      creditId = existing.id;
      totalSent = existing.totalSent ?? 0;
      sendHistory = (existing.sendHistory as typeof sendHistory) ?? [];
    } else {
      const [inserted] = await this.db
        .insert(creditFreeBwz)
        .values({
          username: sendBwzDto.username,
          sendHistory: [],
          totalSent: 0,
        } as CreditFreeBwzInsert)
        .returning();
      if (!inserted) {
        throw new InternalServerErrorException('Failed to create credit history');
      }
      creditId = inserted.id;
      totalSent = 0;
      sendHistory = [];
    }

    if (totalSent >= MAX_BWZ) {
      throw new BadRequestException('User has reached maximum BWZ limit');
    }

    const signature = await this.bwzWalletRepository.creditPlayerBwz(
      sendBwzDto.walletAddress,
      sendBwzDto.amount,
    );

    const newEntry = {
      amount: sendBwzDto.amount,
      timestamp: new Date().toISOString(),
      signature,
      walletAddress: sendBwzDto.walletAddress,
    };

    await this.db
      .update(creditFreeBwz)
      .set({
        sendHistory: [...sendHistory, newEntry],
        totalSent: totalSent + sendBwzDto.amount,
        updatedAt: new Date(),
      } as Record<string, unknown>)
      .where(eq(creditFreeBwz.id, creditId));

    return {
      success: true,
      signature,
    };
  }
}
