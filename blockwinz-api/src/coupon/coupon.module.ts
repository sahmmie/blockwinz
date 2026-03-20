import { Module } from '@nestjs/common';
import { CouponController } from './controllers/coupon.controller';
import { CouponService } from './coupon.service';
import { AuthenticationModule } from '../authentication/authentication.module';
import { BetHistoryModule } from '../betHistory/betHistory.module';
import { TransactionModule } from '../transaction/transaction.module';
import { ReferralModule } from '../referral/referral.module';
import { WalletModule } from '../wallet/wallet.module';
import { GamesModule } from '../games/games.module';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [
    DatabaseModule,
    AuthenticationModule,
    BetHistoryModule,
    TransactionModule,
    ReferralModule,
    WalletModule,
    GamesModule,
  ],
  controllers: [CouponController],
  providers: [CouponService],
  exports: [CouponService],
})
export class CouponModule {}
