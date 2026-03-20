import { ApiProperty } from '@nestjs/swagger';
import { AdminRole } from 'src/shared/enums/adminRole.enum';

export class AdminDto {
  @ApiProperty()
  _id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  isVerified: boolean;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  lastLogout: Date;

  @ApiProperty({ enum: ['super_admin', 'admin', 'moderator'] })
  role: AdminRole;

  @ApiProperty()
  lastLogin: Date;

  @ApiProperty()
  lastLoginIP: string;

  @ApiProperty()
  createdBy: string;

  @ApiProperty()
  updatedBy: string;

  @ApiProperty()
  twoFactorEnabled: boolean;

  @ApiProperty()
  twoFactorSecret: string;

  @ApiProperty()
  failedLoginAttempts: number;

  @ApiProperty()
  lockUntil: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
