import {
  Controller,
  Get,
  HttpCode,
  UseGuards,
  Post,
  Body,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { UserRequestI } from 'src/shared/interfaces/userRequest.type';
import { CurrentUser } from 'src/shared/decorators/currentUser.decorator';
import { WalletDto } from '../dtos/wallet.dto';
import { WalletRepository } from '../repositories/wallet.repository';
import { AuthenticationGuard } from 'src/shared/guards/authentication.guard';
import { CreditFreeBwzDtoReq } from '../dtos/send-bwz.dto';
import { Public } from 'src/shared/decorators/publicApi.decorator';

@ApiTags('Wallet')
@Controller('wallet')
@ApiBearerAuth('JWT-auth')
@UseGuards(AuthenticationGuard)
export class WalletController {
  constructor(private walletRepository: WalletRepository) {}

  @ApiOperation({ summary: 'Get Wallet Address' })
  @Get('getAddress')
  @HttpCode(200)
  @ApiOkResponse({ type: [WalletDto] })
  getWalletAddress(
    @CurrentUser() user: UserRequestI,
  ): Promise<Partial<WalletDto>[]> {
    return this.walletRepository.getWalletAddresses(user);
  }

  @ApiOperation({ summary: 'Get Wallet Address Balances' })
  @ApiQuery({
    name: 'forceRefresh',
    required: false,
    type: Boolean,
    description: 'Force refresh wallet balances from blockchain',
  })
  @Get('balances')
  @HttpCode(200)
  @ApiOkResponse({ type: [WalletDto] })
  getWalletAddressBalances(
    @CurrentUser() user: UserRequestI,
    @Query('forceRefresh') forceRefresh?: string,
  ): Promise<Partial<WalletDto>[]> {
    const forceRefreshBool = forceRefresh === 'true';
    return this.walletRepository.getWalletBalances(user, forceRefreshBool);
  }

  @ApiOperation({ summary: 'Create New Wallet Address' })
  @Get('getNewAddress')
  @HttpCode(201)
  generateWalletAddress(
    @CurrentUser() user: UserRequestI,
  ): Promise<WalletDto[]> {
    return this.walletRepository.generateWalletAddresses(user);
  }

  @Public()
  @Post('send-bwz')
  @ApiOperation({ summary: 'Send BWZ tokens to a user (Testnet only)' })
  @ApiResponse({ status: 200, description: 'BWZ sent successfully' })
  @ApiResponse({
    status: 400,
    description: 'Invalid request or validation failed',
  })
  async sendBwz(@Body() sendBwzDto: CreditFreeBwzDtoReq) {
    return this.walletRepository.sendBwzToUser(sendBwzDto);
  }
}
