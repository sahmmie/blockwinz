import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CoinPriceService } from './coin-price.service';
import { CoinPriceController } from './coin-price.controller';
import { SharedModule } from '../shared/shared.module';

@Module({
  imports: [HttpModule, SharedModule],
  providers: [CoinPriceService],
  controllers: [CoinPriceController],
  exports: [CoinPriceService],
})
export class PricesModule {}
