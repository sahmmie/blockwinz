import { UserRequestI } from 'src/shared/interfaces/userRequest.type';
import {
  Body,
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  DicesRoundEndDto,
  RollDiceDto,
  RollDiceWithGameTokenDto,
} from '../dtos/dice.dto';
import { CurrencyInterceptor } from 'src/shared/interceptors/currency.interceptor';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { DiceService } from '../dice.service';
import { CurrentUser } from 'src/shared/decorators/currentUser.decorator';
import { AuthenticationGuard } from 'src/shared/guards/authentication.guard';

@ApiTags('Games')
@Controller('dice')
@ApiBearerAuth('JWT-auth')
@UseGuards(AuthenticationGuard)
export class DicesController {
  constructor(private readonly diceService: DiceService) {}

  @Post()
  @ApiOperation({
    summary: 'Roll dice for a game',
    description: 'Trigger a dice roll in the game and receive the result',
  })
  @ApiBody({
    type: RollDiceDto,
    description: 'Request body to roll dice in a game',
  })
  @ApiOkResponse({
    description:
      'Response after the dice roll, including whether the player won and the payout',
    type: DicesRoundEndDto,
  })
  @UseInterceptors(CurrencyInterceptor)
  async rollDice(
    @Body() request: RollDiceDto,
    @CurrentUser() user: UserRequestI,
  ): Promise<DicesRoundEndDto> {
    const requestBody: RollDiceWithGameTokenDto = {
      ...request,
    };
    return await this.diceService.getDiceResult(requestBody, user);
  }
}
