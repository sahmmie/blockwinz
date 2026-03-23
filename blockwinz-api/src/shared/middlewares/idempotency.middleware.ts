import {
  Injectable,
  NestMiddleware,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { IDEMPOTENCY_KEY } from '../decorators/idempotencyKey.decorator';
import { Redis } from 'ioredis';
import { InjectRedis } from '@nestjs-modules/ioredis';

/**
 * Idempotent responses for withdrawal creation (and any route this middleware
 * is exclusively applied to). Requires `withdrawal-key` header; caches JSON
 * body for 24h per key.
 */
@Injectable()
export class IdempotencyMiddleware implements NestMiddleware {
  constructor(@InjectRedis() private readonly redis: Redis) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const idempotencyKey = req.headers[IDEMPOTENCY_KEY] as string;
    if (!idempotencyKey?.trim()) {
      throw new HttpException(
        `${IDEMPOTENCY_KEY} header is required`,
        HttpStatus.BAD_REQUEST,
      );
    }

    const key = `idempotency:${idempotencyKey.trim()}`;
    const exists = await this.redis.get(key);

    if (exists) {
      const cachedResponse = JSON.parse(exists) as {
        status: number;
        body: unknown;
      };
      return res.status(cachedResponse.status).json(cachedResponse.body);
    }

    const redis = this.redis;
    const originalJson = res.json.bind(res) as (body: unknown) => Response;

    res.json = (body: unknown) => {
      void redis
        .setex(
          key,
          24 * 60 * 60,
          JSON.stringify({
            status: res.statusCode,
            body,
          }),
        )
        .catch(() => undefined);
      return originalJson(body);
    };

    next();
  }
}
