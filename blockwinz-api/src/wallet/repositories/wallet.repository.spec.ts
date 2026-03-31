import { BadRequestException } from '@nestjs/common';
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
});
