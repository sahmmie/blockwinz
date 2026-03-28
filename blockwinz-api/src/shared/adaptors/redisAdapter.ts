import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';
import { Logger } from '@nestjs/common';
import { SOCKET_IO_CORS } from 'src/shared/constants/cors-origins.constant';

/** Host:port (and user if present) for logs — password never included. */
function formatRedisUrlForLog(url: string): string {
  try {
    const u = new URL(url);
    const auth = u.username ? `${u.username}@` : '';
    const port = u.port || '6379';
    return `${u.protocol}//${auth}${u.hostname}:${port}`;
  } catch {
    return 'redis (invalid URL)';
  }
}

export class RedisIoAdapter extends IoAdapter {
  private adapterConstructor: ReturnType<typeof createAdapter>;
  private readonly logger = new Logger(RedisIoAdapter.name);

  async connectToRedis(): Promise<void> {
    const url = process.env.REDIS_URL?.trim() || 'redis://localhost:6379';
    try {
      console.debug(
        `Connecting to Redis at ${formatRedisUrlForLog(url)} (WebSocket pub/sub)...`,
      );
      const pubClient = createClient({ url });
      const subClient = pubClient.duplicate();

      await Promise.all([pubClient.connect(), subClient.connect()]);

      this.adapterConstructor = createAdapter(pubClient, subClient);
      console.debug(
        `Redis connected at ${formatRedisUrlForLog(url)} (WebSocket adapter ready)`,
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : String(error);
      const stack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Redis connection failed: ${message}`, stack);
    }
  }

  createIOServer(port: number, options?: ServerOptions): any {
    const server = super.createIOServer(port, {
      ...options,
      cors: SOCKET_IO_CORS,
      allowEIO3: true,
    });
    server.adapter(this.adapterConstructor);
    return server;
  }
}
