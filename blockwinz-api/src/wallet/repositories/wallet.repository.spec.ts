import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { WalletRepository } from './wallet.repository';
import { Currency } from '@blockwinz/shared';

describe('WalletRepository', () => {
  const buildDbReturning = (rows: Array<{ id: string }> = []) => ({
    update: jest.fn(() => ({
      set: jest.fn(() => ({
        where: jest.fn(() => ({
          returning: jest.fn().mockResolvedValue(rows),
        })),
      })),
    })),
  });

  const buildRepository = (db: unknown) =>
    new WalletRepository(
      db as never,
      { get: jest.fn() } as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
    );

  it('lockBetFunds rejects when the guarded reservation update fails', async () => {
    const repository = buildRepository(buildDbReturning([]));

    await expect(
      repository.lockBetFunds(
        { _id: 'user-1', id: 'user-1' } as never,
        5,
        Currency.SOL,
      ),
    ).rejects.toThrow(BadRequestException);
  });

  it('lockWithdrawalFunds rejects when the guarded reservation update fails', async () => {
    const repository = buildRepository(buildDbReturning([]));

    await expect(
      repository.lockWithdrawalFunds(
        { _id: 'user-1', id: 'user-1' } as never,
        5,
        Currency.SOL,
      ),
    ).rejects.toThrow(BadRequestException);
  });

  it('isPlayerCustodialWalletAddress returns true when a wallet row exists', async () => {
    const db = {
      select: jest.fn(() => ({
        from: jest.fn(() => ({
          where: jest.fn(() => ({
            limit: jest.fn().mockResolvedValue([{ id: 'w1' }]),
          })),
        })),
      })),
    };
    const repository = buildRepository(db);
    await expect(
      repository.isPlayerCustodialWalletAddress('SomeAddr'),
    ).resolves.toBe(true);
  });

  it('isPlayerCustodialWalletAddress returns false when no wallet row exists', async () => {
    const db = {
      select: jest.fn(() => ({
        from: jest.fn(() => ({
          where: jest.fn(() => ({
            limit: jest.fn().mockResolvedValue([]),
          })),
        })),
      })),
    };
    const repository = buildRepository(db);
    await expect(
      repository.isPlayerCustodialWalletAddress('SomeAddr'),
    ).resolves.toBe(false);
  });

  it('isPlayerCustodialWalletAddress returns false for blank input without querying', async () => {
    const db = { select: jest.fn() };
    const repository = buildRepository(db);
    await expect(
      repository.isPlayerCustodialWalletAddress('   '),
    ).resolves.toBe(false);
    expect(db.select).not.toHaveBeenCalled();
  });

  it('sendBwzToUser rejects when the faucet is disabled', async () => {
    const repository = new WalletRepository(
      {} as never,
      { get: jest.fn().mockReturnValue('false') } as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
    );

    await expect(
      repository.sendBwzToUser({
        username: 'demo',
        walletAddress: 'wallet-1',
        amount: 5,
      } as never),
    ).rejects.toThrow(ForbiddenException);
  });
});
