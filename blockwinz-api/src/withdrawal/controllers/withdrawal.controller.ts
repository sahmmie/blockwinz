import {
  Controller,
  Get,
  Body,
  UseGuards,
  Param,
  HttpCode,
  Headers,
  Put,
} from '@nestjs/common';
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
import { AuthenticationGuard } from 'src/shared/guards/authentication.guard';

@ApiTags('Withdrawals')
@Controller('withdrawals')
@ApiBearerAuth('JWT-auth')
@UseGuards(AuthenticationGuard)
export class WithdrawalController {
  constructor(private readonly withdrawalRepository: WithdrawalRepository) {}

  @Put('request')
  @HttpCode(201)
  @RateLimit({ ttl: 60, limit: 2 }) // 5 requests per minute
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
  ): Promise<WithdrawalDto> {
    return this.withdrawalRepository.getWithdrawalStatus(requestId);
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
