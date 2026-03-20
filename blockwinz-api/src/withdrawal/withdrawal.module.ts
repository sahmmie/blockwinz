import {
  Module,
  MiddlewareConsumer,
  RequestMethod,
  forwardRef,
} from '@nestjs/common';
import { WithdrawalController } from './controllers/withdrawal.controller';
import { WithdrawalRepository } from './repositories/withdrawal.repository';
import { WalletModule } from '../wallet/wallet.module';
import { QueueModule } from 'src/core/queue/queue.module';
import { RateLimitGuard } from 'src/shared/guards/rateLimit.guard';
import { IdempotencyMiddleware } from 'src/shared/middlewares/idempotency.middleware';
import { TransactionModule } from 'src/transaction/transaction.module';

@Module({
  imports: [
    forwardRef(() => WalletModule),
    forwardRef(() => QueueModule),
    TransactionModule,
  ],
  controllers: [WithdrawalController],
  providers: [WithdrawalRepository, RateLimitGuard],
  exports: [WithdrawalRepository],
})
export class WithdrawalModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(IdempotencyMiddleware)
      .forRoutes({ path: 'withdrawals', method: RequestMethod.POST });
  }
}
