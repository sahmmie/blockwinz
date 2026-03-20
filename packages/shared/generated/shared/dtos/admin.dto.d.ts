import { AdminRole } from '@blockwinz/shared';
export declare class AdminDto {
    _id: string;
    email: string;
    isVerified: boolean;
    isActive: boolean;
    lastLogout: Date;
    role: AdminRole;
    lastLogin: Date;
    lastLoginIP: string;
    createdBy: string;
    updatedBy: string;
    twoFactorEnabled: boolean;
    twoFactorSecret: string;
    failedLoginAttempts: number;
    lockUntil: Date;
    createdAt: Date;
    updatedAt: Date;
}
//# sourceMappingURL=admin.dto.d.ts.map