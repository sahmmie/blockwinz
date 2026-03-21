import {
  Body,
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CurrencyInterceptor } from 'src/shared/interceptors/currency.interceptor';
import { UsdStakeResolverInterceptor } from 'src/shared/interceptors/usd-stake-resolver.interceptor';
import {
  ApiTags,
  ApiBody,
  ApiOperation,
  ApiOkResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { WheelService } from '../wheel.service';
import { SpinWheelDto, SpinWheelResponseDto } from '../dtos/wheel.dto';
import { CurrentUser } from 'src/shared/decorators/currentUser.decorator';
import { UserRequestI } from 'src/shared/interfaces/userRequest.type';
import { AuthenticationGuard } from 'src/shared/guards/authentication.guard';

@ApiTags('Games')
@Controller('wheel')
@ApiBearerAuth('JWT-auth')
@UseGuards(AuthenticationGuard)
export class WheelController {
  constructor(private readonly wheelService: WheelService) {}

  @Post('spin')
  @ApiOperation({
    summary: 'Spin the wheel',
    description: 'Spin the wheel and receive the result',
  })
  @ApiBody({
    type: SpinWheelDto,
    description: 'Request body to spin the wheel',
  })
  @ApiOkResponse({
    type: SpinWheelResponseDto,
    description:
      'Response after the wheel spin, including whether the player won and the payout',
  })
  @UseInterceptors(UsdStakeResolverInterceptor, CurrencyInterceptor)
  async rollBall(
    @CurrentUser() user: UserRequestI,
    @Body() request: SpinWheelDto,
  ): Promise<SpinWheelResponseDto> {
    try {
      return await this.wheelService.spin(user, request);
    } catch (error) {
      throw error;
    }
  }
}
