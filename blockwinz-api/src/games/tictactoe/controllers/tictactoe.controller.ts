import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { TicTacToeRepository } from '../repositories/tictactoe.repository';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiBody,
  ApiOkResponse,
} from '@nestjs/swagger';
import { CurrencyInterceptor } from 'src/shared/interceptors/currency.interceptor';
import {
  TicTacToeDto,
  TicTacToeMoveDto,
  TicTacToeStartReqDto,
} from '../dtos/tictactoe.dto';
import { UserRequestI } from 'src/shared/interfaces/userRequest.type';
import { CurrentUser } from 'src/shared/decorators/currentUser.decorator';
import { AuthenticationGuard } from 'src/shared/guards/authentication.guard';
import { Disabled } from 'src/shared/decorators/disabled.decorator';

@ApiTags('Games')
@Controller('tictactoe')
@ApiBearerAuth('JWT-auth')
@UseGuards(AuthenticationGuard)
@Disabled()
export class TictactoeController {
  constructor(private ticTacToeRepository: TicTacToeRepository) {}

  @Post('newGame')
  @ApiOperation({
    summary: 'Create New Game',
    description:
      'Create a new Tic Tac Toe Game if no active game else return active game',
  })
  @ApiBody({
    type: TicTacToeStartReqDto,
    description: 'Request body for a new Tic Tac Toe game',
  })
  @ApiOkResponse({
    description:
      'Response after the dice roll, including whether the player won and the payout',
    type: TicTacToeDto,
  })
  @UseInterceptors(CurrencyInterceptor)
  async createNewGame(
    @Body() requestBody: TicTacToeStartReqDto,
    @CurrentUser() user: UserRequestI,
  ): Promise<TicTacToeDto> {
    return await this.ticTacToeRepository.startNewGame(requestBody, user);
  }

  @Post('makeMove')
  @ApiOperation({
    summary: 'Roll dice for a game',
    description: 'Trigger a dice roll in the game and receive the result',
  })
  @ApiBody({
    type: TicTacToeMoveDto,
    description: 'Request body to roll dice in a game',
  })
  @ApiOkResponse({
    description:
      'Response after the dice roll, including whether the player won and the payout',
    type: TicTacToeMoveDto,
  })
  async makeMove(
    @Body() requestBody: TicTacToeMoveDto,
    @CurrentUser() user: UserRequestI,
  ): Promise<TicTacToeMoveDto> {
    return await this.ticTacToeRepository.makeMove(requestBody, user);
  }

  @Get('game')
  @ApiOperation({
    summary: 'Get Active Tic Tac Toe Game',
    description: 'Get the active game for the user',
  })
  @ApiOkResponse({
    description: 'Response after the game is created or is in progress',
    type: TicTacToeDto,
  })
  async getActiveGame(
    @CurrentUser() user: UserRequestI,
  ): Promise<TicTacToeDto> {
    return await this.ticTacToeRepository.getActiveGame(user);
  }
}
