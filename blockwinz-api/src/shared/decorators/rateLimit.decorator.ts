import { SetMetadata } from '@nestjs/common';

export interface RateLimitOptions {
  ttl: number; // Time window in seconds
  limit: number; // Maximum number of requests in the time window
}

export const RATE_LIMIT_KEY = 'rate_limit';
export const RateLimit = (options: RateLimitOptions) =>
  SetMetadata(RATE_LIMIT_KEY, options);
