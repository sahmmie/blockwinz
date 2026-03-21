import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';
import { LimboService } from '../limbo.service';
import {
  GetLimboResultRequestDto,
  GetLimboResultResponseDto,
} from '../dto/getLimboResult.dto';
import { CurrencyInterceptor } from 'src/shared/interceptors/currency.interceptor';
import { UsdStakeResolverInterceptor } from 'src/shared/interceptors/usd-stake-resolver.interceptor';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserRequestI } from 'src/shared/interfaces/userRequest.type';
import { CurrentUser } from 'src/shared/decorators/currentUser.decorator';
import { Currency } from '@blockwinz/shared';
import { AuthenticationGuard } from 'src/shared/guards/authentication.guard';

@ApiTags('Games')
@Controller('limbo')
@ApiBearerAuth('JWT-auth')
@UseGuards(AuthenticationGuard)
export class LimboController {
  constructor(private readonly limboService: LimboService) {}

  @Post()
  @ApiOperation({
    summary: 'Get Limbo game result',
    description:
      'Fetch the result of a Limbo game based on the provided request data.',
  })
  @ApiBody({
    type: GetLimboResultRequestDto,
    description: 'Data required to get the result for a Limbo game',
    examples: {
      example1: {
        value: {
          betAmount: 0.1,
          currency: Currency.SOL,
          multiplier: 2.5,
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description:
      'Returns the result of the Limbo game, including balance and outcome',
    schema: {
      example: {
        balance: 150,
        outcome: 3.6,
        betResultStatus: 'WIN',
      },
    },
  })
  @UseInterceptors(UsdStakeResolverInterceptor, CurrencyInterceptor)
  async getLimboResult(
    @Body() createLimboDto: GetLimboResultRequestDto,
    @CurrentUser() user: UserRequestI,
  ): Promise<GetLimboResultResponseDto> {
    const requestBody: GetLimboResultRequestDto = {
      ...createLimboDto,
    };
    return await this.limboService.getLimboResult(requestBody, user);
  }
}
