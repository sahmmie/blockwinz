import {
  Inject,
  Injectable,
  NotFoundException,
  NotAcceptableException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { and, eq } from 'drizzle-orm';
import { UserDto } from 'src/shared/dtos/user.dto';
import { getUserId } from 'src/shared/helpers/user.helper';
import { WalletDto } from '../dtos/wallet.dto';
import { CHAIN, Currency } from '@blockwinz/shared';
import { SolanaCoreRepository } from 'src/core/solanaCore/repositories/solanaCore.repository';
import Encryption from 'src/shared/helpers/encryption';
import {
  TransactionStatus,
  TransactionType,
} from '@blockwinz/shared';
import { TransactionRepository } from 'src/transaction/repositories/transaction.repository';
import { DRIZZLE } from 'src/database/constants';
import type { DrizzleDb } from 'src/database/database.module';
import { wallets, type WalletInsert } from 'src/database/schema/wallets';

@Injectable()
export class BwzWalletRepository {
  constructor(
    @Inject(DRIZZLE) private readonly db: DrizzleDb,
    @Inject(ConfigService) public config: ConfigService,
    private solanaCoreRepository: SolanaCoreRepository,
    private transactionRepository: TransactionRepository,
  ) {}

  private toWalletDto(row: typeof wallets.$inferSelect): WalletDto {
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

  public async generateBwzWalletAddress(user: UserDto): Promise<WalletDto> {
    const userId = getUserId(user);
    const [existing] = await this.db
      .select()
      .from(wallets)
      .where(
        and(
          eq(wallets.userId, userId),
          eq(wallets.chain, CHAIN.SOLANA),
          eq(wallets.currency, Currency.BWZ),
        ),
      )
      .limit(1);
    if (existing) {
      throw new NotAcceptableException('Wallet already exists');
    }

    const [sameChainWallet] = await this.db
      .select()
      .from(wallets)
      .where(and(eq(wallets.userId, userId), eq(wallets.chain, CHAIN.SOLANA)))
      .limit(1);

    let address: string;
    let privateKey: string;
    let publicKey: string;

    if (sameChainWallet) {
      address = sameChainWallet.address;
      privateKey = sameChainWallet.privateKey;
      publicKey = sameChainWallet.publicKey;
    } else {
      const newAccount = await this.solanaCoreRepository.createWallet();
      address = newAccount.address;
      const enc = new Encryption(this.config.get('JWT_SECRET') ?? '');
      privateKey = enc.encryptIfNotEncrypted(newAccount.privateKey);
      publicKey = newAccount.publicKey;
    }

    const [inserted] = await this.db
      .insert(wallets)
      .values({
        userId,
        address,
        privateKey,
        publicKey,
        currency: Currency.BWZ,
        chain: CHAIN.SOLANA,
        appBalance: '0',
        pendingWithdrawal: '0',
        lockedInBets: '0',
        onChainBalance: '0',
      } as WalletInsert)
      .returning();
    if (!inserted) throw new Error('Failed to create BWZ wallet');
    return this.toWalletDto(inserted);
  }

  public async getBwzWalletAddress(user: UserDto): Promise<WalletDto> {
    const userId = getUserId(user);
    const [row] = await this.db
      .select()
      .from(wallets)
      .where(
        and(
          eq(wallets.userId, userId),
          eq(wallets.chain, CHAIN.SOLANA),
          eq(wallets.currency, Currency.BWZ),
        ),
      )
      .limit(1);
    if (!row) {
      throw new NotFoundException('Wallet not found');
    }
    return this.toWalletDto(row);
  }

  public async getBwzWalletBalance(
    user: UserDto | { _id?: unknown; id?: string },
    forceRefresh?: boolean,
    tx?: DrizzleDb,
  ): Promise<WalletDto> {
    const db = tx ?? this.db;
    const userId = getUserId(user);
    const [walletRow] = await db
      .select()
      .from(wallets)
      .where(
        and(
          eq(wallets.userId, userId),
          eq(wallets.chain, CHAIN.SOLANA),
          eq(wallets.currency, Currency.BWZ),
        ),
      )
      .limit(1);

    if (!walletRow) {
      throw new NotFoundException('Wallet not found');
    }

    if (forceRefresh) {
      const previousOnChainBalance = Number(walletRow.onChainBalance);
      const onChainBalance = await this.solanaCoreRepository.getBWZBalance(
        walletRow.address,
      );
      const delta = onChainBalance - previousOnChainBalance;

      if (delta > 0) {
        await this.transactionRepository.createTransaction(
          user as UserDto,
          delta,
          null,
          undefined,
          TransactionType.DEPOSIT,
          TransactionStatus.SETTLED,
          new Date(),
          CHAIN.SOLANA,
          Currency.BWZ,
          {
            destinationAddress: walletRow.address,
            requestId: null,
          },
          undefined,
          true,
          tx,
        );
      }

      const [updated] = await db
        .update(wallets)
        .set({
          onChainBalance: String(onChainBalance),
          syncedAt: new Date(),
          updatedAt: new Date(),
          ...(delta > 0
            ? { appBalance: String(Number(walletRow.appBalance) + delta) }
            : {}),
        } as Record<string, unknown>)
        .where(eq(wallets.id, walletRow.id))
        .returning();

      if (updated) return this.toWalletDto(updated);
    }

    return this.toWalletDto(walletRow);
  }

  public async creditPlayerBwz(
    destinationAddress: string,
    totalWinAmount: number,
  ): Promise<string> {
    return await this.solanaCoreRepository.transferBwzToUserWallet(
      destinationAddress,
      totalWinAmount,
    );
  }

  public async debitPlayerBwz(
    userEncryptedPrivateKey: string,
    betAmount: number,
  ): Promise<string> {
    const toBlockWinzAddress = this.config.get('SOLANA_BLOCKWINZ_ADDRESS');
    const centralFeePayerSecretKey = this.config.get(
      'SOLANA_BLOCKWINZ_PRIVATE_KEY',
    );
    const enc = new Encryption(this.config.get('JWT_SECRET') ?? '');

    if (!centralFeePayerSecretKey) {
      throw new BadRequestException('Central fee payer secret key not found');
    }

    if (!toBlockWinzAddress) {
      throw new BadRequestException('Blockwinz address not found');
    }

    const transactionObj = {
      senderSecretKey: enc.decryptIfEncrypted(userEncryptedPrivateKey),
      recipientAddress: toBlockWinzAddress,
      centralFeePayerSecretKey,
      amount: betAmount,
    };

    return await this.solanaCoreRepository.transferBWZWithFeePayer(
      transactionObj,
    );
  }
}
