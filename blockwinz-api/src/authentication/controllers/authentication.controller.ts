import {
  Body,
  Controller,
  Get,
  HttpCode,
  Patch,
  Post,
  HttpStatus,
} from '@nestjs/common';
import { AuthenticationRepository } from '../repositories/authentication.repository';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ChangeEmailDto, LoginDto, UserDto } from 'src/shared/dtos/user.dto';
import { UserAccountEnum } from 'src/shared/enums/userAccount.enums';
import { ApiResponseMessageDto } from 'src/shared/dtos/ApiResponseMessage.dto';
import { CurrentUser } from 'src/shared/decorators/currentUser.decorator';
import { UserRequestI } from 'src/shared/interfaces/userRequest.type';
import { Public } from 'src/shared/decorators/publicApi.decorator';
import { EmailService } from '../../email/email.service';
import { OTPRepository } from '../repositories/otp.repository';
import { WaitlistDto } from 'src/shared/dtos/waitlist.dto';

@ApiTags('Authentication')
@Controller('authentication')
export class AuthenticationController {
  constructor(
    private authenticationRepository: AuthenticationRepository,
    private readonly emailService: EmailService,
    private readonly otpRepository: OTPRepository,
  ) {}

  @Public()
  @ApiBody({
    type: UserDto,
    examples: {
      default: {
        value: {
          username: 'Sahmmie',
          password: '1234567890',
          email: 'smarsatto@gmail.com',
          userAccounts: [UserAccountEnum.USER],
          referralCode: 'REF123456',
        } as UserDto,
      },
    },
  })
  @ApiOperation({ summary: 'Create Account' })
  @Post('registration')
  @HttpCode(201)
  userSignup(@Body() user: UserDto): Promise<{ user: UserDto; token: string }> {
    return this.authenticationRepository.saveUser(user);
  }

  @Public()
  @ApiBody({
    type: UserDto,
    examples: {
      email_login: {
        value: {
          username: 'smarsatto@gmail.com',
          password: '1234567890',
        } as UserDto,
      },
      phoneNumber_login: {
        value: {
          username: '09033172104',
          password: '1234567890',
        } as UserDto,
      },
    },
  })
  @ApiOperation({ summary: 'Account Login' })
  @Post('login')
  @HttpCode(200)
  userLogin(@Body() user: LoginDto): Promise<{ token: string }> {
    return this.authenticationRepository.findUserAndGenerateToken(user);
  }

  @ApiBody({
    type: UserDto,
    examples: {
      default: {
        value: {
          currentPassword: '1234567890',
          newPassword: '1234567890',
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
  userLogout(@CurrentUser() user: UserRequestI): Promise<{
    message: string;
    status: string;
  }> {
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
