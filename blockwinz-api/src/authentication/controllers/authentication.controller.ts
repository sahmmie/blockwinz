import {
  Body,
  Controller,
  Get,
  HttpCode,
  Patch,
  Post,
  HttpStatus,
  Req,
  Res,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { decode } from 'jsonwebtoken';
import { AuthenticationRepository } from '../repositories/authentication.repository';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ChangeEmailDto, LoginDto, UserDto } from 'src/shared/dtos/user.dto';
import { UserAccountEnum } from '@blockwinz/shared';
import { ApiResponseMessageDto } from 'src/shared/dtos/ApiResponseMessage.dto';
import { CurrentUser } from 'src/shared/decorators/currentUser.decorator';
import { UserRequestI } from 'src/shared/interfaces/userRequest.type';
import { Public } from 'src/shared/decorators/publicApi.decorator';
import { EmailService } from '../../email/email.service';
import { OTPRepository } from '../repositories/otp.repository';
import { WaitlistDto } from 'src/shared/dtos/waitlist.dto';
import { RefreshTokenService } from '../services/refresh-token.service';
import { RateLimitGuard } from 'src/shared/guards/rateLimit.guard';
import { RateLimit } from 'src/shared/decorators/rateLimit.decorator';
import { getUserId } from 'src/shared/helpers/user.helper';

@ApiTags('Authentication')
@Controller('authentication')
@UseGuards(RateLimitGuard)
export class AuthenticationController {
  constructor(
    private authenticationRepository: AuthenticationRepository,
    private readonly emailService: EmailService,
    private readonly otpRepository: OTPRepository,
    private readonly refreshTokenService: RefreshTokenService,
  ) {}

  @Public()
  @RateLimit({ ttl: 3600, limit: 15 })
  @ApiBody({
    type: UserDto,
    examples: {
      default: {
        value: {
          username: 'example_user',
          password: 'Str0ng!Ex4mpleP@ss',
          email: 'user@example.com',
          userAccounts: [UserAccountEnum.USER],
          referralCode: 'REFEXAMPLE',
        } as UserDto,
      },
    },
  })
  @ApiOperation({ summary: 'Create Account' })
  @Post('registration')
  @HttpCode(201)
  async userSignup(
    @Body() user: UserDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ user: UserDto; token: string }> {
    const out = await this.authenticationRepository.saveUser(user);
    await this.refreshTokenService.setRefreshToken(getUserId(out.user), res);
    return out;
  }

  @Public()
  @RateLimit({ ttl: 60, limit: 25 })
  @ApiBody({
    type: UserDto,
    examples: {
      email_login: {
        value: {
          username: 'user@example.com',
          password: 'Str0ng!Ex4mpleP@ss',
        } as UserDto,
      },
      phoneNumber_login: {
        value: {
          username: '0123456789',
          password: 'Str0ng!Ex4mpleP@ss',
        } as UserDto,
      },
    },
  })
  @ApiOperation({ summary: 'Account Login' })
  @Post('login')
  @HttpCode(200)
  async userLogin(
    @Body() user: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ token: string }> {
    const out = await this.authenticationRepository.findUserAndGenerateToken(user);
    const payload = decode(out.token) as { _id?: string } | null;
    if (payload?._id) {
      await this.refreshTokenService.setRefreshToken(payload._id, res);
    }
    return out;
  }

  @Public()
  @RateLimit({ ttl: 60, limit: 30 })
  @ApiOperation({ summary: 'Refresh access token (httpOnly refresh cookie)' })
  @Post('refresh')
  @HttpCode(200)
  async refreshSession(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ token: string }> {
    const userId = await this.refreshTokenService.rotateRefreshSession(
      req,
      res,
    );
    if (!userId) {
      throw new UnauthorizedException('Invalid or expired session');
    }
    const profile = await this.authenticationRepository.findUserWithProfile(
      userId,
    );
    return {
      token: this.authenticationRepository.createAccessToken(profile),
    };
  }

  @ApiBody({
    type: UserDto,
    examples: {
      default: {
        value: {
          currentPassword: 'CurrentStr0ng!P@ss',
          newPassword: 'NewStr0ng!P@ss',
        },
      },
    },
  })
  @ApiOperation({ summary: 'Change Password' })
  @ApiBearerAuth('JWT-auth')
  @Patch('change-password')
  @HttpCode(202)
  userChangePassword(
    @CurrentUser() user: UserRequestI,
    @Body() body: { currentPassword; newPassword } & UserDto,
  ) {
    return this.authenticationRepository.changePassword(
      body?.currentPassword,
      body?.newPassword,
      user,
    );
  }

  @ApiResponse({
    type: ApiResponseMessageDto,
    status: 200,
  })
  @ApiOperation({ summary: 'Account Logout' })
  @ApiBearerAuth('JWT-auth')
  @Get('logout')
  async userLogout(
    @CurrentUser() user: UserRequestI,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{
    message: string;
    status: string;
  }> {
    await this.refreshTokenService.revokeFromRequest(req);
    this.refreshTokenService.clearCookie(res);
    return this.authenticationRepository.logoutAccount(user);
  }

  @ApiResponse({
    type: UserDto,
    status: 200,
  })
  @ApiOperation({ summary: 'Get profile' })
  @ApiBearerAuth('JWT-auth')
  @Get('profile')
  @HttpCode(200)
  userProfile(@CurrentUser() user: UserRequestI): Promise<UserDto> {
    return this.authenticationRepository.findUserWithProfile(user._id);
  }

  @Public()
  @RateLimit({ ttl: 3600, limit: 10 })
  @ApiOperation({ summary: 'Request Password Reset' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: {
          type: 'string',
          example: 'user@example.com',
          description: 'Email address of the user requesting password reset',
        },
      },
      required: ['email'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Password reset OTP sent successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Password reset OTP sent successfully',
        },
      },
    },
  })
  @Post('password-reset/request')
  @HttpCode(HttpStatus.OK)
  async requestPasswordReset(@Body('email') email: string) {
    return await this.authenticationRepository.requestPasswordReset(email);
  }

  @Public()
  @RateLimit({ ttl: 900, limit: 15 })
  @ApiOperation({ summary: 'Verify and Reset Password' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: {
          type: 'string',
          example: 'user@example.com',
          description: 'Email address of the user',
        },
        otp: {
          type: 'string',
          example: '123456',
          description: 'One-time password received via email',
        },
        newPassword: {
          type: 'string',
          example: 'newSecurePassword123',
          description: 'New password to set',
        },
      },
      required: ['email', 'otp', 'newPassword'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Password reset successful',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Password reset successful',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid or expired OTP',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Invalid or expired OTP',
        },
      },
    },
  })
  @Post('password-reset/verify')
  @HttpCode(HttpStatus.OK)
  async verifyAndResetPassword(
    @Body('email') email: string,
    @Body('otp') otp: string,
    @Body('newPassword') newPassword: string,
  ) {
    const validOTP = await this.otpRepository.findValidOTP(email, otp);

    if (!validOTP) {
      throw new Error('Invalid or expired OTP');
    }

    // Find user by email
    const user = await this.authenticationRepository.findUserByEmail(email);

    // Update password
    await this.authenticationRepository.updatePassword(email, newPassword);

    // Mark OTP as used
    await this.otpRepository.markAsUsed(validOTP._id);

    // Log out the user
    await this.authenticationRepository.logoutAccount(user);

    return { message: 'Password reset successful' };
  }

  @Public()
  @RateLimit({ ttl: 3600, limit: 40 })
  @ApiOperation({ summary: 'Join Waitlist' })
  @ApiBody({
    type: WaitlistDto,
    examples: {
      default: {
        value: {
          email: 'user@example.com',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully joined the waitlist',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Successfully joined the waitlist',
        },
      },
    },
  })
  @Post('waitlist')
  @HttpCode(HttpStatus.OK)
  async joinWaitlist(@Body() waitlistDto: WaitlistDto) {
    return this.authenticationRepository.joinWaitlist(waitlistDto.email);
  }

  @Public()
  @RateLimit({ ttl: 3600, limit: 40 })
  @ApiOperation({ summary: 'Verify Email' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        token: {
          type: 'string',
          example: 'verification_token_here',
          description: 'Email verification token sent to user email',
        },
      },
      required: ['token'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Email verified successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Email verified successfully' },
      },
    },
  })
  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  async verifyEmail(@Body('token') token: string) {
    return this.authenticationRepository.verifyEmail(token);
  }

  @Public()
  @RateLimit({ ttl: 3600, limit: 20 })
  @ApiOperation({ summary: 'Resend Verification Email' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: {
          type: 'string',
          example: 'user@example.com',
          description: 'User email address',
        },
      },
      required: ['email'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Verification email resent successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Verification email resent successfully',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Verification email resend limit reached',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Verification email resend limit reached',
        },
      },
    },
  })
  @Post('resend-verification')
  @HttpCode(HttpStatus.OK)
  async resendVerification(@Body('email') email: string) {
    return this.authenticationRepository.resendVerificationEmail(email);
  }

  @ApiOperation({ summary: 'Change Email' })
  @ApiBody({ type: ChangeEmailDto })
  @ApiResponse({
    status: 200,
    description: 'Email changed successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Email changed successfully',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Email change failed',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Email change failed',
        },
      },
    },
  })
  @Patch('change-email')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  async changeEmail(
    @Body() body: ChangeEmailDto,
    @CurrentUser() user: UserRequestI,
  ) {
    return this.authenticationRepository.changeEmail(user, body.email);
  }
}
