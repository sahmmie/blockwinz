import { UserRequestI } from 'src/shared/interfaces/userRequest.type';
import {
  Body,
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  GetCoinFlipResultDto,
  GetCoinFlipResultResponseDto,
} from '../dtos/coinflip.dto';
import { CurrencyInterceptor } from '../../../shared/interceptors/currency.interceptor';
import { UsdStakeResolverInterceptor } from '../../../shared/interceptors/usd-stake-resolver.interceptor';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CoinFlipService } from '../coinflip.service';
import { CurrentUser } from 'src/shared/decorators/currentUser.decorator';
import { AuthenticationGuard } from 'src/shared/guards/authentication.guard';

@ApiTags('Games')
@Controller('coinflip')
@ApiBearerAuth('JWT-auth')
@UseGuards(AuthenticationGuard)
export class CoinFlipController {
  constructor(private readonly coinFlipService: CoinFlipService) {}

  /**
   * Plays one coin flip round and returns outcomes; persists game, wallet, and bet history in one transaction.
   *
   * @param request - Stake and flip configuration (`coins`, `min`, `coinType`, etc.)
   * @param user - Current authenticated user
   * @returns Flip results, payout multiplier, and win/lose status
   */
  @Post()
  @ApiOperation({
    summary: 'Get coin flip result',
    description:
      'Run a provably fair multi-coin flip round and return results with payout multiplier.',
  })
  @ApiBody({
    type: GetCoinFlipResultDto,
    description: 'Request body to play a coin flip round',
  })
  @ApiOkResponse({
    description:
      'Per-coin results (0/1), payout multiplier (0 on loss), and status',
    type: GetCoinFlipResultResponseDto,
  })
  @UseInterceptors(UsdStakeResolverInterceptor, CurrencyInterceptor)
  async getCoinFlipResult(
    @Body() request: GetCoinFlipResultDto,
    @CurrentUser() user: UserRequestI,
  ): Promise<GetCoinFlipResultResponseDto> {
    return await this.coinFlipService.getCoinFlipResult(request, user);
  }
}
