import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash, randomBytes } from 'crypto';
import { Request, Response } from 'express';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';

@Injectable()
export class RefreshTokenService {
  static readonly COOKIE_NAME = 'bwz_refresh';

  private readonly ttlSeconds = 60 * 60 * 24 * 30;

  constructor(
    @InjectRedis() private readonly redis: Redis,
    private readonly config: ConfigService,
  ) {}

  private hash(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private cookieOptions(maxAgeMs: number) {
    const isProd = this.config.get('NODE_ENV') === 'production';
    if (!isProd) {
      return {
        httpOnly: true,
        secure: false,
        sameSite: 'lax' as const,
        path: '/',
        maxAge: maxAgeMs,
      };
    }
    return {
      httpOnly: true,
      secure: true,
      sameSite: 'none' as const,
      path: '/',
      maxAge: maxAgeMs,
    };
  }

  async setRefreshToken(userId: string, res: Response): Promise<void> {
    const raw = randomBytes(32).toString('hex');
    const key = `refresh:${this.hash(raw)}`;
    await this.redis.setex(
      key,
      this.ttlSeconds,
      JSON.stringify({ userId }),
    );
    res.cookie(
      RefreshTokenService.COOKIE_NAME,
      raw,
      this.cookieOptions(this.ttlSeconds * 1000),
    );
  }

  clearCookie(res: Response): void {
    const opts = this.cookieOptions(0);
    res.clearCookie(RefreshTokenService.COOKIE_NAME, {
      ...opts,
      maxAge: 0,
    });
  }

  async revokeFromRequest(req: Request): Promise<void> {
    const raw = req.cookies?.[RefreshTokenService.COOKIE_NAME] as
      | string
      | undefined;
    if (!raw) return;
    await this.redis.del(`refresh:${this.hash(raw)}`);
  }

  /**
   * Validates current refresh cookie, rotates refresh token in Redis + cookie.
   * @returns userId or null
   */
  async rotateRefreshSession(req: Request, res: Response): Promise<string | null> {
    const raw = req.cookies?.[RefreshTokenService.COOKIE_NAME] as
      | string
      | undefined;
    if (!raw) return null;
    const redisKey = `refresh:${this.hash(raw)}`;
    const payload = await this.redis.get(redisKey);
    if (!payload) {
      this.clearCookie(res);
      return null;
    }
    await this.redis.del(redisKey);
    let userId: string;
    try {
      userId = (JSON.parse(payload) as { userId: string }).userId;
    } catch {
      this.clearCookie(res);
      return null;
    }
    await this.setRefreshToken(userId, res);
    return userId;
  }
}
