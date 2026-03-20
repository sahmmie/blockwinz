import {
  Body,
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CurrencyInterceptor } from 'src/shared/interceptors/currency.interceptor';
import { PlinkoRepository } from '../repositories/plinko.repository';
import {
  GetPlinkoResultRequestDto,
  GetPlinkoResultResponseDto,
} from '../dtos/plinko.dto';
import { CurrentUser } from 'src/shared/decorators/currentUser.decorator';
import { UserRequestI } from 'src/shared/interfaces/userRequest.type';
import { AuthenticationGuard } from 'src/shared/guards/authentication.guard';

@ApiTags('Games')
@Controller('plinko')
@ApiBearerAuth('JWT-auth')
@UseGuards(AuthenticationGuard)
export class PlinkoController {
  constructor(private readonly plinkoRepository: PlinkoRepository) {}

  @Post('roll')
  @UseInterceptors(CurrencyInterceptor)
  @ApiOperation({ summary: 'Roll the ball in Plinko game and get the result' })
  @ApiBody({
    type: GetPlinkoResultRequestDto,
    description: 'The request data to get the Plinko game result',
  })
  @ApiOkResponse({
    status: 200,
    description: 'Successfully retrieved Plinko result',
    type: GetPlinkoResultResponseDto,
  })
  async rollBall(
    @CurrentUser() user: UserRequestI,
    @Body() request: GetPlinkoResultRequestDto,
  ): Promise<GetPlinkoResultResponseDto> {
    const requestBody: GetPlinkoResultRequestDto = {
      ...request,
    };
    return await this.plinkoRepository.getPlinkoResult(user, requestBody);
  }
}
