import { Controller, Get, Inject, ServiceUnavailableException } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import { DRIZZLE } from './database/constants';
import type { DrizzleDb } from './database/database.module';
import { sql } from 'drizzle-orm';
import { Public } from './shared/decorators/publicApi.decorator';

@Controller()
export class AppController {
  constructor(
    @Inject(DRIZZLE) private readonly db: DrizzleDb,
    @InjectRedis() private readonly redis: Redis,
  ) {}

  @Public()
  @Get('health/live')
  live() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }

  @Public()
  @Get('health/ready')
  async ready() {
    try {
      await Promise.all([
        this.db.execute(sql`select 1`),
        this.redis.ping(),
      ]);
    } catch (error) {
      throw new ServiceUnavailableException({
        status: 'error',
        message: error instanceof Error ? error.message : 'Readiness check failed',
      });
    }

    return {
      status: 'ok',
      checks: {
        database: 'ok',
        redis: 'ok',
      },
      timestamp: new Date().toISOString(),
    };
  }
}
