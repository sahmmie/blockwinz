import { WithdrawalQueueProcessor } from './withdrawalQueue.processor';
import {
  TransactionStatus,
  WithdrawalStatus,
  Currency,
} from '@blockwinz/shared';

describe('WithdrawalQueueProcessor', () => {
  const posthogService = {
    capture: jest.fn(),
  };

  const makeDb = () => ({
    transaction: jest.fn(async (cb: (tx: unknown) => Promise<void>) => cb({})),
  });
  const makeJob = () =>
    ({
      data: {
        user: { _id: 'user-1', id: 'user-1', username: 'demo' },
        transaction: { _id: 'tx-1', id: 'tx-1' },
        withdrawal: {
          requestId: 'req-1',
          amount: 5,
          currency: Currency.SOL,
          destinationAddress: 'dest',
        },
      },
    }) as never;

  it('settles withdrawal bookkeeping after a successful chain send', async () => {
    posthogService.capture.mockReset();
    const db = makeDb();
    const walletRepository = {
      withdrawFunds: jest.fn().mockResolvedValue('signature-1'),
      debitPlayer: jest.fn().mockResolvedValue(undefined),
      releaseWithdrawalFunds: jest.fn().mockResolvedValue(undefined),
    };
    const transaction = {
      _id: 'tx-1',
      status: TransactionStatus.PENDING,
      txid: null,
      fulfillmentDate: null,
      onChain: false,
    };
    const transactionRepository = {
      getTransactionById: jest.fn().mockResolvedValue(transaction),
      updateTransaction: jest.fn().mockResolvedValue(transaction),
    };
    const withdrawalRepository = {
      requireWithdrawalByRequestId: jest.fn().mockResolvedValue({
        requestId: 'req-1',
        amount: 5,
        currency: Currency.SOL,
      }),
      updateWithdrawal: jest.fn().mockResolvedValue({
        requestId: 'req-1',
        status: WithdrawalStatus.COMPLETED,
      }),
    };

    const processor = new WithdrawalQueueProcessor(
      db as never,
      walletRepository as never,
      transactionRepository as never,
      withdrawalRepository as never,
      posthogService as never,
    );

    await processor.processWithdrawal(makeJob());

    expect(walletRepository.withdrawFunds).toHaveBeenCalled();
    expect(walletRepository.debitPlayer).toHaveBeenCalled();
    expect(walletRepository.releaseWithdrawalFunds).toHaveBeenCalled();
    expect(transactionRepository.updateTransaction).toHaveBeenCalled();
    expect(withdrawalRepository.updateWithdrawal).toHaveBeenCalledWith(
      'req-1',
      expect.objectContaining({
        status: WithdrawalStatus.COMPLETED,
        transactionHash: 'signature-1',
      }),
      expect.any(Object),
    );
    expect(posthogService.capture).toHaveBeenCalledWith(
      'withdrawal_completed',
      'user-1',
      expect.objectContaining({
        requestId: 'req-1',
      }),
    );
  });

  it('does not mark failed or release funds after a successful chain payout if local settlement fails', async () => {
    posthogService.capture.mockReset();
    const db = makeDb();
    const walletRepository = {
      withdrawFunds: jest.fn().mockResolvedValue('signature-1'),
      debitPlayer: jest.fn().mockRejectedValue(new Error('db failed')),
      releaseWithdrawalFunds: jest.fn().mockResolvedValue(undefined),
    };
    const transaction = {
      _id: 'tx-1',
      status: TransactionStatus.PENDING,
      txid: null,
      fulfillmentDate: null,
      onChain: false,
    };
    const transactionRepository = {
      getTransactionById: jest
        .fn()
        .mockResolvedValueOnce(transaction)
        .mockResolvedValueOnce({
          ...transaction,
          txid: 'signature-1',
          onChain: true,
        }),
      updateTransaction: jest.fn().mockResolvedValue(transaction),
    };
    const withdrawalRepository = {
      requireWithdrawalByRequestId: jest
        .fn()
        .mockResolvedValueOnce({
          requestId: 'req-1',
          amount: 5,
          currency: Currency.SOL,
          status: WithdrawalStatus.PENDING,
        })
        .mockResolvedValueOnce({
          requestId: 'req-1',
          amount: 5,
          currency: Currency.SOL,
          status: WithdrawalStatus.PENDING,
          transactionHash: 'signature-1',
        }),
      updateWithdrawal: jest.fn().mockResolvedValue({
        requestId: 'req-1',
        status: WithdrawalStatus.PENDING,
        transactionHash: 'signature-1',
      }),
    };

    const processor = new WithdrawalQueueProcessor(
      db as never,
      walletRepository as never,
      transactionRepository as never,
      withdrawalRepository as never,
      posthogService as never,
    );

    await expect(processor.processWithdrawal(makeJob())).rejects.toThrow(
      'db failed',
    );

    expect(walletRepository.withdrawFunds).toHaveBeenCalledTimes(1);
    expect(transactionRepository.updateTransaction).toHaveBeenCalledTimes(1);
    expect(withdrawalRepository.updateWithdrawal).toHaveBeenCalledTimes(1);
    expect(walletRepository.releaseWithdrawalFunds).not.toHaveBeenCalled();
    expect(db.transaction).toHaveBeenCalledTimes(1);
  });
});
