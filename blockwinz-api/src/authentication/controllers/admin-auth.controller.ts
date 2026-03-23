import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { RateLimitGuard } from 'src/shared/guards/rateLimit.guard';
import { RateLimit } from 'src/shared/decorators/rateLimit.decorator';
import { AdminAuthRepository } from '../repositories/admin-auth.repository';
import {
  ApiOperation,
  ApiTags,
  ApiBearerAuth,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { Public } from 'src/shared/decorators/publicApi.decorator';
import { CurrentUser } from 'src/shared/decorators/currentUser.decorator';
import { AdminDto } from 'src/shared/dtos/admin.dto';
import { AdminRole } from '@blockwinz/shared';
import { AdminCreationGuard } from 'src/shared/guards/admin-creation.guard';

@ApiTags('Admin Authentication')
@Controller('admin/auth')
@UseGuards(RateLimitGuard)
export class AdminAuthController {
  constructor(private readonly adminAuthRepository: AdminAuthRepository) {}

  @Public()
  @ApiOperation({
    summary: 'Initiate Admin Login',
    description: 'Sends OTP to admin email for authentication',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: {
          type: 'string',
          example: 'admin@example.com',
          description: 'Admin email address',
        },
      },
      required: ['email'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'OTP sent successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'OTP sent to your email',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Invalid credentials',
        },
      },
    },
  })
  @Post('login')
  @RateLimit({ ttl: 300, limit: 15 })
  async initiateLogin(@Body('email') email: string) {
    return this.adminAuthRepository.initiateLogin(email);
  }

  @Public()
  @ApiOperation({
    summary: 'Verify Admin OTP',
    description: 'Verify OTP and get JWT token for admin access',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: {
          type: 'string',
          example: 'admin@example.com',
          description: 'Admin email address',
        },
        otp: {
          type: 'string',
          example: '00000000',
          description: 'One-time password received via email',
        },
      },
      required: ['email', 'otp'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'OTP verified successfully',
    schema: {
      type: 'object',
      properties: {
        access_token: {
          type: 'string',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
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
  @Post('verify-otp')
  @RateLimit({ ttl: 300, limit: 25 })
  async verifyOTP(@Body('email') email: string, @Body('otp') otp: string) {
    return this.adminAuthRepository.verifyOTP(email, otp);
  }

  @ApiOperation({
    summary: 'Create Admin Account',
    description: 'Create a new admin account (requires super_admin privileges)',
  })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(AdminCreationGuard)
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: {
          type: 'string',
          example: 'newadmin@blockwinz.com',
          description: 'Email address for the new admin',
        },
        role: {
          type: 'string',
          enum: ['admin', 'moderator'],
          example: 'admin',
          description: 'Role for the new admin (cannot be super_admin)',
        },
      },
      required: ['email', 'role'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Admin created successfully',
    type: AdminDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Email already exists or invalid role',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Email already exists',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Only super admins can create new admins',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Only super admins can create new admins',
        },
      },
    },
  })
  @Post('create')
  async createAdmin(
    @Body('email') email: string,
    @Body('role') role: AdminRole,
  ) {
    if (role === 'super_admin') {
      throw new BadRequestException('Cannot create super_admin accounts');
    }
    return this.adminAuthRepository.createAdmin(email, role);
  }

  @ApiOperation({
    summary: 'Admin Logout',
    description: 'Logout admin and invalidate current session',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiResponse({
    status: 200,
    description: 'Logout successful',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Logout successful',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Unauthorized',
        },
      },
    },
  })
  @Get('logout')
  async logout(@CurrentUser() admin: AdminDto) {
    return this.adminAuthRepository.logout(admin._id);
  }
}
