import {
  Controller,
  Get,
  HttpCode,
  Param,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Request } from 'express';
import { BetHistoryService } from '../betHistory.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from 'src/shared/decorators/currentUser.decorator';
import { UserRequestI } from 'src/shared/interfaces/userRequest.type';
import { Public } from 'src/shared/decorators/publicApi.decorator';
import { PaginatedDataI } from 'src/shared/interfaces/pagination.interface';
import { BetHistoryDto } from '../dtos/betHistory.dto';
import { Cache as CacheDecorator } from 'src/shared/decorators/cache.decorator';
import { CustomCacheInterceptor } from 'src/shared/interceptors/cache.interceptor';
import { RateLimitGuard } from 'src/shared/guards/rateLimit.guard';
import { RateLimit } from 'src/shared/decorators/rateLimit.decorator';

@ApiTags('Bet History')
@Controller('bet-history')
@ApiBearerAuth('JWT-auth')
@UseGuards(RateLimitGuard)
@UseInterceptors(CustomCacheInterceptor)
export class BetHistoryController {
  constructor(private readonly betHistoryService: BetHistoryService) {}

  @Public()
  @RateLimit({ ttl: 60, limit: 60 })
  @ApiResponse({
    type: [BetHistoryDto],
    status: 200,
  })
  @ApiOperation({ summary: 'Get Bet Histories by lastest or by bet amount' })
  @Get('/all')
  @HttpCode(200)
  @CacheDecorator('bet-histories', 60) // Cache for 60 seconds
  getBetHistories(
    @Query('limit') limit: string,
    @Query('sortyBy') sortyBy: 'latest' | 'totalWinAmount',
  ): Promise<PaginatedDataI<BetHistoryDto>> {
    return this.betHistoryService.getBetHistories(
      parseInt(limit),
      1,
      sortyBy,
    );
  }

  @ApiResponse({
    type: BetHistoryDto,
    status: 200,
  })
  @ApiOperation({ summary: 'Get Bet History By ID' })
  @Get(':betId')
  @HttpCode(200)
  getBetHistoryById(
    @Param('betId') betId: string,
    @CurrentUser() user: UserRequestI,
    @Req() req: Request,
  ): Promise<BetHistoryDto> {
    return this.betHistoryService.getBetHistoryById(betId, user, req['isAdmin'] === true);
  }

  @ApiResponse({
    type: [BetHistoryDto],
    status: 200,
  })
  @ApiOperation({ summary: 'Get User Bet History' })
  @Get()
  @HttpCode(200)
  getUserBetHistory(
    @CurrentUser() user: UserRequestI,
    @Query('limit') limit: string,
    @Query('page') page: string,
  ): Promise<PaginatedDataI<BetHistoryDto>> {
    return this.betHistoryService.getUserBetHistory(
      user.id,
      parseInt(limit),
      parseInt(page),
    );
  }
}
