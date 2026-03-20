import {
  Controller,
  Get,
  Post,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ReferralService } from '../referral.service';
import { ReferralStatsResponseDto } from '../dtos/referral-tracking.dto';
import { AuthenticationGuard } from 'src/shared/guards/authentication.guard';

@ApiTags('referral')
@Controller('referral')
@UseGuards(AuthenticationGuard)
@ApiBearerAuth('JWT-auth')
export class ReferralController {
  constructor(private readonly referralService: ReferralService) {}

  @Get('code')
  @ApiOperation({
    summary: 'Get or generate referral code for the current user',
  })
  @ApiResponse({ status: 200, description: 'Returns the referral code' })
  async getReferralCode(@Request() req): Promise<{ code: string }> {
    const code = await this.referralService.generateReferralCode(req.user.id);
    return { code };
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get referral statistics for the current user' })
  @ApiResponse({
    status: 200,
    description: 'Returns referral statistics',
    type: ReferralStatsResponseDto,
  })
  async getReferralStats(@Request() req): Promise<ReferralStatsResponseDto> {
    return this.referralService.getReferralStats(req.user.id);
  }

  @Post('process/:referredId')
  @ApiOperation({ summary: 'Process a referral for a new user' })
  @ApiResponse({ status: 200, description: 'Referral processed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid referral request' })
  async processReferral(
    @Request() req,
    @Param('referredId') referredId: string,
  ): Promise<void> {
    await this.referralService.processReferral(req.user.id, referredId);
  }
}
