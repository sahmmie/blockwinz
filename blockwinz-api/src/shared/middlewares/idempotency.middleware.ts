import {
  Injectable,
  NestMiddleware,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { Reflector } from '@nestjs/core';
import { IDEMPOTENCY_KEY } from '../decorators/idempotencyKey.decorator';
import { Redis } from 'ioredis';
import { InjectRedis } from '@nestjs-modules/ioredis';

@Injectable()
export class IdempotencyMiddleware implements NestMiddleware {
  constructor(
    private reflector: Reflector,
    @InjectRedis() private readonly redis: Redis,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const requiresIdempotency = this.reflector.get<boolean>(
      IDEMPOTENCY_KEY,
      req.route?.stack[0]?.handle,
    );

    if (!requiresIdempotency) {
      return next();
    }

    const idempotencyKey = req.headers[IDEMPOTENCY_KEY] as string;
    if (!idempotencyKey) {
      throw new HttpException(
        `${IDEMPOTENCY_KEY} header is required`,
        HttpStatus.BAD_REQUEST,
      );
    }

    const key = `idempotency:${idempotencyKey}`;
    const exists = await this.redis.get(key);

    if (exists) {
      // Return cached response
      const cachedResponse = JSON.parse(exists);
      return res.status(cachedResponse.status).json(cachedResponse.body);
    }

    // Store the original res.json method
    const originalJson = res.json;
    res.json = function (body: any) {
      // Cache the response
      this.redis.setex(
        key,
        24 * 60 * 60,
        JSON.stringify({
          status: res.statusCode,
          body,
        }),
      );
      return originalJson.call(this, body);
    };

    next();
  }
}
