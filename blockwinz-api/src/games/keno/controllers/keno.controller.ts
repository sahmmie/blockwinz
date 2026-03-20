import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import { KenoBetRequestDto, KenoBetResponseDto } from '../dto/keno.dto';
import { kenoData } from '../constants';
import { KenoRisk } from '../enums/keno.enums';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { KenoRepository } from '../repositories/keno.repositories';
import { CurrencyInterceptor } from 'src/shared/interceptors/currency.interceptor';
import { CurrentUser } from 'src/shared/decorators/currentUser.decorator';
import { UserRequestI } from 'src/shared/interfaces/userRequest.type';
import { AuthenticationGuard } from 'src/shared/guards/authentication.guard';

@ApiTags('Games')
@Controller('keno')
@ApiTags('Games')
@ApiBearerAuth('JWT-auth')
@UseGuards(AuthenticationGuard)
export class KenoController {
  constructor(private readonly kenoRepository: KenoRepository) {}

  @Post('bet')
  @ApiOperation({
    summary: 'Place a Keno bet',
    description: 'Place a bet on the Keno game and receive the result',
  })
  @ApiBody({
    type: KenoBetRequestDto,
    description:
      'Details of the Keno bet including the amount, currency, and selected numbers',
  })
  @ApiOkResponse({
    description:
      'Response after placing the Keno bet, including the outcome, payout, balance, and drawn numbers',
    type: KenoBetResponseDto,
  })
  @UseInterceptors(CurrencyInterceptor)
  async bet(
    @CurrentUser() user: UserRequestI,
    @Body() request: KenoBetRequestDto,
  ): Promise<KenoBetResponseDto> {
    const requestBody: KenoBetRequestDto = {
      ...request,
    };
    return await this.kenoRepository.getKenoResult(user, requestBody);
  }

  @Get('risk-data')
  @ApiOperation({
    summary: 'Get Keno risk data',
    description: 'Retrieve Keno data based on risk level',
  })
  @ApiQuery({
    name: 'risk',
    description: 'Risk level of the Keno game (e.g., low, medium, high)',
    enum: KenoRisk,
    example: 'low',
  })
  @ApiOkResponse({
    description:
      'Returns the Keno payout structure based on the selected risk level',
    schema: {
      example: {
        low: {
          '1': {
            '0': 0.7,
            '1': 1.85,
          },
          '2': {
            '0': 0,
            '1': 2,
            '2': 3.8,
          },
        },
      },
    },
  })
  async getData(@Query('risk') risk: KenoRisk) {
    return kenoData[risk];
  }
}
