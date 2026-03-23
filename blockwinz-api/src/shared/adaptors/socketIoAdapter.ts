import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';
import { SOCKET_IO_CORS } from 'src/shared/constants/cors-origins.constant';

export class SocketIoAdapter extends IoAdapter {
  createIOServer(port: number, options?: ServerOptions): any {
    const server = super.createIOServer(port, {
      cors: SOCKET_IO_CORS,
      ...options,
    });
    return server;
  }
}
