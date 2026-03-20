import { SetMetadata } from '@nestjs/common';

export const CACHE_KEY = 'cache_key';
export const CACHE_TTL = 'cache_ttl';

export const Cache = (key: string, ttl: number = 60) => {
  return (target: any, key: string, descriptor: PropertyDescriptor) => {
    SetMetadata(CACHE_KEY, key)(target, key, descriptor);
    SetMetadata(CACHE_TTL, ttl)(target, key, descriptor);
    return descriptor;
  };
};
