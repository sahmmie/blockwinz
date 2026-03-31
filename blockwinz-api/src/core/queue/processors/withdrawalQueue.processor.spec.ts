import { WithdrawalQueueProcessor } from './withdrawalQueue.processor';
import { TransactionStatus, WithdrawalStatus, Currency } from '@blockwinz/shared';

describe('WithdrawalQueueProcessor', () => {
  const makeDb = () => ({
    transaction: jest.fn(async (cb: (tx: unknown) => Promise<void>) => cb({})),
  });

  it('settles withdrawal bookkeeping after a successful chain send', async () => {
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
    );

    await processor.processWithdrawal({
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
    } as never);

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
  });
});
