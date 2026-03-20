import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Get,
  Param,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { CouponService } from '../coupon.service';
import {
  CreateCouponDto,
  ClaimCouponDto,
  CouponResponseDto,
} from '../dtos/coupon.dto';
import { AuthenticationGuard } from 'src/shared/guards/authentication.guard';

@ApiTags('Coupons')
@Controller('coupons')
@ApiBearerAuth('JWT-auth')
export class CouponController {
  constructor(private readonly couponService: CouponService) {}

  @Post()
  @UseGuards(AuthenticationGuard)
  @ApiOperation({
    summary: 'Create a new coupon',
    description:
      'Create a new coupon with specified reward and conditions. Admin only. The coupon can have various conditions like daily login streak, minimum games played, minimum deposit amount, or referral requirements.',
  })
  @ApiBody({
    type: CreateCouponDto,
    description:
      'Coupon creation data including code, reward, and conditions. The reward can be bonus balance, tokens, or free spins.',
  })
  @ApiResponse({
    status: 201,
    description: 'Coupon created successfully',
    type: CouponResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data or coupon code already exists',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Admin access required',
  })
  async createCoupon(@Body() createCouponDto: CreateCouponDto) {
    return this.couponService.createCoupon(createCouponDto);
  }

  @Get(':code')
  @UseGuards(AuthenticationGuard)
  @ApiOperation({
    summary: 'Get coupon details',
    description:
      'Retrieve detailed information about a specific coupon by its code. This endpoint returns all coupon details including reward type, amount, expiry date, and current redemption status.',
  })
  @ApiParam({
    name: 'code',
    description: 'The unique code of the coupon to retrieve',
    type: String,
    example: 'WELCOME2024',
  })
  @ApiResponse({
    status: 200,
    description:
      'Returns coupon details including reward information and redemption status',
    type: CouponResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Coupon not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Authentication required',
  })
  async getCoupon(@Param('code') code: string) {
    return this.couponService.getCoupon(code);
  }

  @Post('claim')
  @UseGuards(AuthenticationGuard)
  @ApiOperation({
    summary: 'Claim a coupon',
    description:
      'Claim a coupon reward if all conditions are met. The system will validate all required tasks (daily login, games played, minimum deposit, referrals) before applying the reward.',
  })
  @ApiBody({
    type: ClaimCouponDto,
    description:
      'Coupon claim data containing the coupon code. The system will validate all conditions before applying the reward.',
  })
  @ApiResponse({
    status: 200,
    description:
      "Coupon claimed successfully. The reward has been applied to the user's account.",
    type: CouponResponseDto,
  })
  @ApiResponse({
    status: 400,
    description:
      'Invalid coupon or conditions not met (e.g., expired, already claimed, required tasks not completed)',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Authentication required',
  })
  @ApiResponse({
    status: 404,
    description: 'Coupon not found',
  })
  async claimCoupon(
    @Request() req,
    @Body() claimCouponDto: ClaimCouponDto,
  ): Promise<CouponResponseDto> {
    return this.couponService.claimCoupon(req.user.id, claimCouponDto);
  }
}
