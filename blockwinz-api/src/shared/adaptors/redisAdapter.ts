import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';
import { Logger } from '@nestjs/common';

export class RedisIoAdapter extends IoAdapter {
  private adapterConstructor: ReturnType<typeof createAdapter>;
  private readonly logger = new Logger(RedisIoAdapter.name);

  async connectToRedis(): Promise<void> {
    try {
      const pubClient = createClient({
        url: process.env.REDIS_URL?.trim() || 'redis://localhost:6379',
      });
      const subClient = pubClient.duplicate();

      await Promise.all([pubClient.connect(), subClient.connect()]);

      this.adapterConstructor = createAdapter(pubClient, subClient);
      this.logger.verbose(
        'Redis adapter initialized and ready for WebSocket connections',
      );
    } catch (error) {
      this.logger.error(error);
    }
  }

  createIOServer(port: number, options?: ServerOptions): any {
    const server = super.createIOServer(port, {
      ...options,
      cors: {
        origin: [
          'https://staging.blockwinz.com',
          'https://blockwinz.com',
          'http://localhost:5173',
          'https://bwzfunding.netlify.app',
        ],
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: [
          'Content-Type',
          'Authorization',
          'X-Requested-With',
          'withdrawal-key',
        ],
      },
      allowEIO3: true,
    });
    server.adapter(this.adapterConstructor);
    return server;
  }
}
