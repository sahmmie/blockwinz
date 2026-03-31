import { Test, TestingModule } from '@nestjs/testing';
import { WithdrawalController } from './withdrawal.controller';
import { WithdrawalRepository } from '../repositories/withdrawal.repository';
import { PosthogService } from 'src/posthog/posthog.service';
import { RateLimitGuard } from 'src/shared/guards/rateLimit.guard';
import { Currency } from '@blockwinz/shared';

describe('WithdrawalController', () => {
  let controller: WithdrawalController;

  const withdrawalRepository = {
    createWithdrawal: jest.fn(),
  };
  const posthogService = {
    capture: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WithdrawalController],
      providers: [
        { provide: WithdrawalRepository, useValue: withdrawalRepository },
        { provide: PosthogService, useValue: posthogService },
      ],
    })
      .overrideGuard(RateLimitGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get(WithdrawalController);
  });

  it('captures withdrawal_submitted after a request is created', async () => {
    withdrawalRepository.createWithdrawal.mockResolvedValue({
      amount: 5,
      currency: Currency.SOL,
      requestId: 'req-1',
      approvalType: 'automatic',
    });

    await controller.createWithdrawal(
      { _id: 'user-1', id: 'user-1' } as never,
      'req-1',
      {
        amount: 5,
        currency: Currency.SOL,
        destinationAddress: 'masked',
      } as never,
    );

    expect(posthogService.capture).toHaveBeenCalledWith(
      'withdrawal_submitted',
      'user-1',
      expect.objectContaining({
        requestId: 'req-1',
        currency: Currency.SOL,
      }),
    );
  });
});
