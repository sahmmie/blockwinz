import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { currencyData } from 'src/shared/constants/currency.constant';

@Injectable()
export class CurrencyInterceptor implements NestInterceptor {
  private readonly logger = new Logger('CurrencyInterceptor');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { currency, betAmount } = request.body;

    if (currency === undefined || betAmount === undefined) {
      throw new BadRequestException('Currency and betAmount are required');
    }

    const currencyInfo = currencyData[currency];

    if (!currencyInfo) {
      throw new BadRequestException(`Unsupported token has: ${currency}`);
    }

    const { minAmount, maxBet, maxProfit } = currencyInfo;

    if (betAmount > maxBet) {
      throw new BadRequestException(
        `betAmount must be less than or equal to ${maxBet} for currency ${currency}`,
      );
    }

    this.logger.debug(
      `
        CurrencyInterceptor
          TokenHash: ${currency}
          BetAmount: ${betAmount}
          MinAmount: ${minAmount}
          MaxBet: ${maxBet}
          MaxProfit: ${maxProfit}
      `,
    );

    if (betAmount < minAmount && betAmount !== 0) {
      throw new BadRequestException(
        `betAmount must be at least ${minAmount} for currency ${currency}`,
      );
    }

    return next.handle();
  }
}
