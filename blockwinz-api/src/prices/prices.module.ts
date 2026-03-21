import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CoinPriceService } from './coin-price.service';
import { CoinPriceController } from './coin-price.controller';
import { SharedModule } from '../shared/shared.module';
import { UsdStakeResolverInterceptor } from 'src/shared/interceptors/usd-stake-resolver.interceptor';

@Module({
  imports: [HttpModule, SharedModule],
  providers: [CoinPriceService, UsdStakeResolverInterceptor],
  controllers: [CoinPriceController],
  exports: [CoinPriceService, UsdStakeResolverInterceptor],
})
export class PricesModule {}
