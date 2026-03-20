import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { MinesService } from '../mines.service';
import {
  MinesResponseDto,
  RevealMineDto,
  StartMineDto,
} from '../dto/mines.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from 'src/shared/decorators/currentUser.decorator';
import { UserRequestI } from 'src/shared/interfaces/userRequest.type';
import { CurrencyInterceptor } from 'src/shared/interceptors/currency.interceptor';
import { AuthenticationGuard } from 'src/shared/guards/authentication.guard';

@ApiTags('Games')
@Controller('mines')
@ApiBearerAuth('JWT-auth')
@UseGuards(AuthenticationGuard)
export class MinesController {
  constructor(private readonly minesService: MinesService) {}

  @Post('start')
  @ApiOperation({ summary: 'Start a new mine game' })
  @UseInterceptors(CurrencyInterceptor)
  @ApiBody({ type: StartMineDto })
  @ApiOkResponse({
    status: 201,
    description: 'Game started successfully',
    type: MinesResponseDto,
  })
  async start(
    @CurrentUser() user: UserRequestI,
    @Body() request: StartMineDto,
  ): Promise<MinesResponseDto> {
    const requestBody: StartMineDto = {
      ...request,
    };
    return await this.minesService.start(user, requestBody);
  }

  @Post('reveal')
  @ApiOperation({ summary: 'Reveal a tile in the mine game' })
  @ApiBody({ type: RevealMineDto })
  @ApiOkResponse({
    status: 201,
    description: 'Tile revealed succesfully',
    type: MinesResponseDto,
  })
  async reveal(
    @CurrentUser() user: UserRequestI,
    @Body() request: RevealMineDto,
  ): Promise<MinesResponseDto> {
    const requestBody: RevealMineDto = {
      ...request,
    };
    return await this.minesService.reveal(user, requestBody);
  }

  @Post('cashout')
  @ApiOperation({ summary: 'Cashout current active mines game' })
  @ApiOkResponse({
    status: 201,
    description: 'Game cashed out successfully',
    type: MinesResponseDto,
  })
  async cashout(@CurrentUser() user: UserRequestI): Promise<MinesResponseDto> {
    return await this.minesService.cashout(user);
  }

  @Get('active-game')
  @ApiOperation({ summary: 'Fetching current active game for mines' })
  @ApiOkResponse({
    status: 200,
    description: 'Game found and returned',
    type: MinesResponseDto,
  })
  async getActiveGame(
    @CurrentUser() user: UserRequestI,
  ): Promise<MinesResponseDto> {
    return await this.minesService.getActiveGame(user.id);
  }
}
