import {
  Controller,
  Get,
  Body,
  UseGuards,
  Param,
  HttpCode,
  Headers,
  Put,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { WithdrawalRepository } from '../repositories/withdrawal.repository';
import { UserRequestI } from 'src/shared/interfaces/userRequest.type';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import {
  IDEMPOTENCY_KEY,
  IdempotencyKey,
} from 'src/shared/decorators/idempotencyKey.decorator';
import { RateLimit } from 'src/shared/decorators/rateLimit.decorator';
import { WithdrawalDto, WithdrawalDtoRequest } from '../dtos/withdrawal.dto';
import { CurrentUser } from 'src/shared/decorators/currentUser.decorator';
import { RateLimitGuard } from 'src/shared/guards/rateLimit.guard';
import { getUserId } from 'src/shared/helpers/user.helper';

@ApiTags('Withdrawals')
@Controller('withdrawals')
@ApiBearerAuth('JWT-auth')
@UseGuards(RateLimitGuard)
export class WithdrawalController {
  constructor(private readonly withdrawalRepository: WithdrawalRepository) {}

  @Put('request')
  @HttpCode(201)
  @RateLimit({ ttl: 60, limit: 2 })
  @IdempotencyKey()
  @ApiOperation({ summary: 'Create a new withdrawal request' })
  @ApiResponse({
    status: 201,
    description: 'Withdrawal request created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request or limits exceeded',
  })
  async createWithdrawal(
    @CurrentUser() user: UserRequestI,
    @Headers(IDEMPOTENCY_KEY) idempotencyKey: string,
    @Body() body: WithdrawalDtoRequest,
  ): Promise<WithdrawalDto> {
    return this.withdrawalRepository.createWithdrawal(
      user,
      body.amount,
      body.currency,
      body.destinationAddress,
      idempotencyKey,
    );
  }

  @Get('status/:requestId')
  @ApiOperation({ summary: 'Get withdrawal status' })
  @ApiResponse({
    status: 200,
    description: 'Withdrawal status retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Withdrawal not found' })
  async getWithdrawalStatus(
    @Param('requestId') requestId: string,
    @CurrentUser() user: UserRequestI,
    @Req() req: Request,
  ): Promise<WithdrawalDto> {
    return this.withdrawalRepository.getWithdrawalStatusForRequester(
      requestId,
      {
        userId: getUserId(user),
        isAdmin: req['isAdmin'] === true,
      },
    );
  }

  @Get('history')
  @ApiOperation({ summary: 'Get user withdrawal history' })
  @ApiResponse({
    status: 200,
    description: 'Withdrawal history retrieved successfully',
  })
  async getUserWithdrawals(
    @CurrentUser() user: UserRequestI,
  ): Promise<WithdrawalDto[]> {
    return this.withdrawalRepository.getUserWithdrawals(user._id);
  }
}
