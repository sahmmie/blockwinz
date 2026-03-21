import {
  BadRequestException,
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Currency, StakeDenomination } from '@blockwinz/shared';
import { CoinPriceService } from 'src/prices/coin-price.service';
import { currencyData } from 'src/shared/constants/currency.constant';
import { ROUND_DECIMALS } from 'src/shared/constants/extra.constatnt';

/** Minimum positive stake when specifying size in USD (zero-stake play is allowed separately). */
const MIN_USD_STAKE = 1;

@Injectable()
export class UsdStakeResolverInterceptor implements NestInterceptor {
  constructor(private readonly coinPriceService: CoinPriceService) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<unknown>> {
    const request = context.switchToHttp().getRequest();
    const body = request.body as {
      stakeDenomination?: StakeDenomination;
      currency?: Currency;
      usdAmount?: number;
      betAmount?: number;
    };
    if (!body || body.stakeDenomination !== StakeDenomination.Usd) {
      return next.handle();
    }
    if (body.currency !== Currency.SOL) {
      throw new BadRequestException(
        'USD-denominated stakes are only supported for SOL',
      );
    }
    const usdRaw = body.usdAmount;
    const betIn = Number(body.betAmount);
    if (usdRaw === undefined || usdRaw === null) {
      if (Number.isFinite(betIn) && betIn === 0) {
        body.betAmount = 0;
        return next.handle();
      }
      throw new BadRequestException(
        'usdAmount is required when stakeDenomination is usd (unless betAmount is 0)',
      );
    }
    const usdAmount = Number(usdRaw);
    if (Number.isNaN(usdAmount)) {
      throw new BadRequestException('usdAmount must be a number');
    }
    if (usdAmount < 0) {
      throw new BadRequestException('usdAmount must not be negative');
    }
    if (usdAmount === 0) {
      body.betAmount = 0;
      return next.handle();
    }
    if (usdAmount < MIN_USD_STAKE) {
      throw new BadRequestException(
        `Minimum USD stake is ${MIN_USD_STAKE} USD (or use 0 for a free round)`,
      );
    }

    let priceUsdPerSol: number;
    try {
      const quote = await this.coinPriceService.getSolUsdQuote();
      priceUsdPerSol = quote.priceUsdPerSol;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Unable to resolve SOL/USD';
      throw new BadRequestException(msg);
    }

    const maxBetSol = currencyData[Currency.SOL].maxBet;
    const maxUsd = maxBetSol * priceUsdPerSol;
    if (usdAmount > maxUsd) {
      throw new BadRequestException(
        `usdAmount must be less than or equal to ${maxUsd.toFixed(2)} USD`,
      );
    }

    const rawSol = usdAmount / priceUsdPerSol;
    const factor = 10 ** ROUND_DECIMALS;
    const betAmountSol = Math.ceil(rawSol * factor) / factor;

    body.betAmount = betAmountSol;
    return next.handle();
  }
}
