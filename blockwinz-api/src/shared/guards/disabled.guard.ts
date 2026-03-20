import {
  CanActivate,
  Injectable,
  HttpException,
  HttpStatus,
  ExecutionContext,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  DISABLED_MESSAGE_KEY,
  DISABLED_STATUS_KEY,
} from '../decorators/disabled.decorator';

/**
 * Guard that blocks access to disabled routes
 * Throws a FORBIDDEN exception when the guard is activated
 */
@Injectable()
export class DisabledGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const message = this.reflector.getAllAndOverride<string>(
      DISABLED_MESSAGE_KEY,
      [context.getHandler(), context.getClass()],
    );

    const statusCode = this.reflector.getAllAndOverride<number>(
      DISABLED_STATUS_KEY,
      [context.getHandler(), context.getClass()],
    );

    throw new HttpException(
      message || 'This endpoint is currently disabled',
      statusCode || HttpStatus.FORBIDDEN,
    );
  }
}
