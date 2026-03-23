import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  RATE_LIMIT_KEY,
  RateLimitOptions,
} from '../decorators/rateLimit.decorator';
import { Redis } from 'ioredis';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { getUserId } from '../helpers/user.helper';

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @InjectRedis() private readonly redis: Redis,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const rateLimitOptions = this.reflector.get<RateLimitOptions>(
      RATE_LIMIT_KEY,
      context.getHandler(),
    );

    if (!rateLimitOptions) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{
      ip?: string;
      method?: string;
      route?: { path?: string };
      path?: string;
      user?: unknown;
    }>();
    const ip = request.ip ?? 'unknown';
    const routePath = request.route?.path ?? request.path ?? 'unknown';
    const method = request.method ?? 'unknown';
    const userId = getUserId(request.user as Parameters<typeof getUserId>[0]);
    const identity = userId || 'anon';
    const key = `rate_limit:${method}:${routePath}:${identity}:${ip}`;

    const current = await this.redis.incr(key);
    if (current === 1) {
      await this.redis.expire(key, rateLimitOptions.ttl);
    }

    if (current > rateLimitOptions.limit) {
      throw new HttpException(
        'Too Many Requests',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return true;
  }
}
