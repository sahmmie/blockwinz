import { Controller, Get, HttpCode, Query, UseGuards } from '@nestjs/common';
import { TransactionRepository } from '../repositories/transaction.repository';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AuthenticationGuard } from 'src/shared/guards/authentication.guard';
import { CurrentUser } from 'src/shared/decorators/currentUser.decorator';
import { TransactionDto } from '../dtos/transaction.dto';
import { UserRequestI } from 'src/shared/interfaces/userRequest.type';
import { TransactionType } from '@blockwinz/shared';
import { PaginatedDataI } from 'src/shared/interfaces/pagination.interface';

@ApiTags('Transaction')
@Controller('transaction')
@ApiBearerAuth('JWT-auth')
@UseGuards(AuthenticationGuard)
export class TransactionController {
  constructor(private transactionRepository: TransactionRepository) {}

  @ApiOperation({ summary: 'Get Transactions' })
  @Get('getTransactions')
  @HttpCode(200)
  @ApiOkResponse({ type: [TransactionDto] })
  getTransactions(
    @CurrentUser() user: UserRequestI,
    @Query('type') type: TransactionType,
    @Query('limit') limit: number,
    @Query('page') page: number,
  ): Promise<PaginatedDataI<TransactionDto>> {
    return this.transactionRepository.getTransactions(user, type, limit, page);
  }
}
