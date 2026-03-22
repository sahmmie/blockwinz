import { CallHandler, ExecutionContext } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CoinFlipController } from './coinflip.controller';
import { CoinFlipService } from '../coinflip.service';
import {
  GetCoinFlipResultDto,
  GetCoinFlipResultResponseDto,
} from '../dtos/coinflip.dto';
import { CoinFlipGameStatus } from '../enums/coinflip.enums';
import { Currency } from '@blockwinz/shared';
import { AuthenticationGuard } from 'src/shared/guards/authentication.guard';
import { CurrencyInterceptor } from 'src/shared/interceptors/currency.interceptor';
import { UsdStakeResolverInterceptor } from 'src/shared/interceptors/usd-stake-resolver.interceptor';

describe('CoinFlipController', () => {
  let controller: CoinFlipController;
  let service: CoinFlipService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CoinFlipController],
      providers: [
        {
          provide: CoinFlipService,
          useValue: {
            getCoinFlipResult: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(AuthenticationGuard)
      .useValue({ canActivate: () => true })
      .overrideInterceptor(UsdStakeResolverInterceptor)
      .useValue({
        intercept: (_ctx: ExecutionContext, next: CallHandler) => next.handle(),
      })
      .overrideInterceptor(CurrencyInterceptor)
      .useValue({
        intercept: (_ctx: ExecutionContext, next: CallHandler) => next.handle(),
      })
      .compile();

    controller = module.get<CoinFlipController>(CoinFlipController);
    service = module.get<CoinFlipService>(CoinFlipService);
  });

  /**
   * Ensures the HTTP handler delegates to the application service with the same payload and user.
   */
  describe('getCoinFlipResult', () => {
    it('should call coinFlipService.getCoinFlipResult with correct parameters', async () => {
      const request: GetCoinFlipResultDto = {
        betAmount: 10,
        currency: Currency.SOL,
        min: 1,
        coins: 3,
        coinType: 1,
      };
      const mockUser = { _id: 'user123', id: 'user123' } as never;
      const mockResponse: GetCoinFlipResultResponseDto = {
        results: [1, 0, 1],
        multiplier: 2.5,
        betResultStatus: CoinFlipGameStatus.WIN,
      };

      jest.spyOn(service, 'getCoinFlipResult').mockResolvedValue(mockResponse);

      const result = await controller.getCoinFlipResult(request, mockUser);

      expect(service.getCoinFlipResult).toHaveBeenCalledWith(request, mockUser);
      expect(result).toEqual(mockResponse);
    });
  });
});
