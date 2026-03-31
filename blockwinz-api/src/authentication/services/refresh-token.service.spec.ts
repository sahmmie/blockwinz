import { ForbiddenException } from '@nestjs/common';
import { RefreshTokenService } from './refresh-token.service';
import { CORS_ORIGIN_WHITELIST } from 'src/shared/constants/cors-origins.constant';
import type { Request } from 'express';

describe('RefreshTokenService', () => {
  const buildService = (nodeEnv: string = 'production') =>
    new RefreshTokenService(
      {} as never,
      { get: jest.fn().mockReturnValue(nodeEnv) } as never,
    );

  const buildRequest = (headers: Record<string, string | undefined>) =>
    ({
      get: (name: string) => headers[name.toLowerCase()],
    }) as Request;

  it('accepts trusted origins for cookie-based refresh flows', () => {
    const service = buildService();
    const request = buildRequest({
      origin: CORS_ORIGIN_WHITELIST[0],
    });

    expect(() => service.validateRequestOrigin(request)).not.toThrow();
  });

  it('rejects untrusted origins for cookie-based refresh flows', () => {
    const service = buildService();
    const request = buildRequest({
      origin: 'https://evil.example.com',
    });

    expect(() => service.validateRequestOrigin(request)).toThrow(
      ForbiddenException,
    );
  });

  it('requires origin metadata in production', () => {
    const service = buildService('production');
    const request = buildRequest({});

    expect(() => service.validateRequestOrigin(request)).toThrow(
      ForbiddenException,
    );
  });
});
