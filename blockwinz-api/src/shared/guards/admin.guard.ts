import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AdminRole } from 'src/shared/enums/adminRole.enum';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<AdminRole[]>(
      'roles',
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user) {
      throw new UnauthorizedException('Authentication required');
    }

    if (!user.role) {
      throw new UnauthorizedException('Invalid admin role');
    }

    // Super admin has access to everything
    if (user.role === 'super_admin') {
      return true;
    }

    // Check if user's role is in required roles
    return requiredRoles.includes(user.role);
  }
}
