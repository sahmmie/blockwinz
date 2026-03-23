import { Injectable, Logger } from '@nestjs/common';
import Redis from 'ioredis';
import { InjectRedis } from '@nestjs-modules/ioredis';

@Injectable()
export class RedisService {
  private readonly logger = new Logger(RedisService.name);

  constructor(@InjectRedis() private readonly redis: Redis) {}

  async getValue(key: string): Promise<string | null> {
    try {
      const value = await this.redis.get(key);
      return value === null ? null : JSON.parse(value);
    } catch (error) {
      this.logger.error(`Error getting value for key ${key}:`, error);
      return null;
    }
  }

  async setValue(key: string, value: string): Promise<void> {
    try {
      await this.redis.set(key, JSON.stringify(value));
    } catch (error) {
      if (error.message?.includes('READONLY')) {
        this.logger.warn(
          `Redis is in read-only mode. Cannot set value for key: ${key}`,
        );
        return;
      }
      this.logger.error(`Error setting value for key ${key}:`, error);
      throw error;
    }
  }

  async delKey(key: string): Promise<void> {
    try {
      await this.redis.del(key);
    } catch (error) {
      if (error.message?.includes('READONLY')) {
        this.logger.warn(
          `Redis is in read-only mode. Cannot delete key: ${key}`,
        );
        return;
      }
      this.logger.error(`Error deleting key ${key}:`, error);
      throw error;
    }
  }

  async getAllKeys(pattern = '*'): Promise<string[]> {
    return await this.redis.keys(pattern);
  }

  async sAdd(key: string, value: string): Promise<number> {
    try {
      return await this.redis.sadd(key, value);
    } catch (error) {
      if (error.message?.includes('READONLY')) {
        this.logger.warn(
          `Redis is in read-only mode. Cannot add to set: ${key}`,
        );
        return 0;
      }
      this.logger.error(`Error adding to set ${key}:`, error);
      throw error;
    }
  }

  async sRem(key: string, value: string): Promise<number> {
    try {
      return await this.redis.srem(key, value);
    } catch (error) {
      if (error.message?.includes('READONLY')) {
        this.logger.warn(
          `Redis is in read-only mode. Cannot remove from set: ${key}`,
        );
        return 0;
      }
      this.logger.error(`Error removing from set ${key}:`, error);
      throw error;
    }
  }

  async sMembers(key: string): Promise<string[]> {
    return await this.redis.smembers(key);
  }

  async sIsMember(key: string, value: string): Promise<number> {
    return await this.redis.sismember(key, value);
  }

  async sCard(key: string): Promise<number> {
    return await this.redis.scard(key);
  }

  async sPop(key: string): Promise<string> {
    try {
      return await this.redis.spop(key);
    } catch (error) {
      if (error.message?.includes('READONLY')) {
        this.logger.warn(
          `Redis is in read-only mode. Cannot pop from set: ${key}`,
        );
        return null;
      }
      this.logger.error(`Error popping from set ${key}:`, error);
      throw error;
    }
  }

  async sRandMember(key: string): Promise<string> {
    return await this.redis.srandmember(key);
  }

  async sRandMembers(key: string, count: number): Promise<string[]> {
    return await this.redis.srandmember(key, count);
  }

  // Hash operations
  async hGet(key: string, field: string): Promise<string | null> {
    return await this.redis.hget(key, field);
  }

  async hSet(key: string, field: string, value: string): Promise<number> {
    try {
      return await this.redis.hset(key, field, value);
    } catch (error) {
      if (error.message?.includes('READONLY')) {
        this.logger.warn(
          `Redis is in read-only mode. Cannot set hash field: ${key}:${field}`,
        );
        return 0;
      }
      this.logger.error(`Error setting hash field ${key}:${field}:`, error);
      throw error;
    }
  }

  async hDel(key: string, field: string): Promise<number> {
    try {
      return await this.redis.hdel(key, field);
    } catch (error) {
      if (error.message?.includes('READONLY')) {
        this.logger.warn(
          `Redis is in read-only mode. Cannot delete hash field: ${key}:${field}`,
        );
        return 0;
      }
      this.logger.error(`Error deleting hash field ${key}:${field}:`, error);
      throw error;
    }
  }

  async hGetAll(key: string): Promise<Record<string, string>> {
    return await this.redis.hgetall(key);
  }

  async hExists(key: string, field: string): Promise<number> {
    return await this.redis.hexists(key, field);
  }

  /**
   * FIFO queue: push on the left head (newest); pop from the right tail (oldest waiting player).
   */
  async lPush(key: string, value: string): Promise<number> {
    try {
      return await this.redis.lpush(key, value);
    } catch (error) {
      this.logger.error(`Error LPUSH ${key}:`, error);
      throw error;
    }
  }

  async rPush(key: string, value: string): Promise<number> {
    try {
      return await this.redis.rpush(key, value);
    } catch (error) {
      this.logger.error(`Error RPUSH ${key}:`, error);
      throw error;
    }
  }

  /**
   * Non-blocking pop from the right tail of a list.
   */
  async rPop(key: string): Promise<string | null> {
    try {
      const v = await this.redis.rpop(key);
      return v;
    } catch (error) {
      this.logger.error(`Error RPOP ${key}:`, error);
      throw error;
    }
  }

  /**
   * Returns list length or 0.
   */
  async lLen(key: string): Promise<number> {
    return await this.redis.llen(key);
  }

  /**
   * Remove matching elements from a list (e.g. dequeue a user on cancel).
   */
  async lRem(key: string, count: number, value: string): Promise<number> {
    try {
      return await this.redis.lrem(key, count, value);
    } catch (error) {
      this.logger.error(`Error LREM ${key}:`, error);
      throw error;
    }
  }

  async expire(key: string, seconds: number): Promise<number> {
    return await this.redis.expire(key, seconds);
  }

  /** JSON value with TTL (multiplayer presence, etc.). */
  async setJsonEx(key: string, value: unknown, ttlSec: number): Promise<void> {
    try {
      await this.redis.set(key, JSON.stringify(value), 'EX', ttlSec);
    } catch (error) {
      this.logger.error(`Error setJsonEx ${key}:`, error);
    }
  }

  async getJson(key: string): Promise<unknown | null> {
    try {
      const raw = await this.redis.get(key);
      if (raw === null) return null;
      return JSON.parse(raw) as unknown;
    } catch (error) {
      this.logger.error(`Error getJson ${key}:`, error);
      return null;
    }
  }
}
