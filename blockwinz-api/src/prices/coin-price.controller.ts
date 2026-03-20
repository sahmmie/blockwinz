import { Controller, Get, UseGuards } from '@nestjs/common';
import { CoinPriceService } from './coin-price.service';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthenticationGuard } from 'src/shared/guards/authentication.guard';

@ApiTags('Prices')
@Controller('price')
@ApiBearerAuth('JWT-auth')
@UseGuards(AuthenticationGuard)
export class CoinPriceController {
  constructor(private readonly coinPriceService: CoinPriceService) {}

  /**
   * Returns an array of coins and their prices: [{symbol: 'BTC', price: ...}, {symbol: 'ETH', price: ...}, {symbol: 'SOL', price: ...}, {symbol: 'BWZ', price: 1.1}]
   */
  @Get()
  @ApiOperation({
    summary: 'Get all supported coin prices',
    description:
      'Returns an array of supported coins and their prices (BTC, ETH, SOL, BWZ).',
  })
  @ApiOkResponse({
    description: 'Array of coin prices',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          symbol: { type: 'string', example: 'BTC' },
          price: { type: 'number', example: 107433.6271 },
          dev: { type: 'boolean', example: true },
          last_updated_at: { type: 'number', example: 1750868686 },
        },
      },
    },
  })
  async getAllCoinPrices() {
    return await this.coinPriceService.getCachedPrice();
  }
}
