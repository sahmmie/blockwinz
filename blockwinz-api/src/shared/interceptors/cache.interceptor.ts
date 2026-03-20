import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Inject,
} from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Reflector } from '@nestjs/core';
import { CACHE_KEY, CACHE_TTL } from '../decorators/cache.decorator';

@Injectable()
export class CustomCacheInterceptor implements NestInterceptor {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private reflector: Reflector,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const cacheKey = this.reflector.get<string>(
      CACHE_KEY,
      context.getHandler(),
    );
    const ttl =
      this.reflector.get<number>(CACHE_TTL, context.getHandler()) * 1000; // Convert to milliseconds

    if (!cacheKey) {
      return next.handle();
    }

    // Create a unique key based on the cache key and query parameters
    const queryParams = request.query;
    const sortedParams = Object.keys(queryParams)
      .sort()
      .reduce((acc, key) => {
        acc[key] = queryParams[key];
        return acc;
      }, {});

    const uniqueKey = `${cacheKey}-${JSON.stringify(sortedParams)}`;
    const cachedData = await this.cacheManager.get(uniqueKey);

    if (cachedData) {
      return of(cachedData);
    }

    return next.handle().pipe(
      tap(async (data) => {
        await this.cacheManager.set(uniqueKey, data, ttl);
      }),
    );
  }
}
