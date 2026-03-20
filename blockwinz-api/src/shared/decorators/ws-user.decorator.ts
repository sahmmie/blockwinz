import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Socket } from 'socket.io';
import { UserDto } from '../dtos/user.dto';

export const WsUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): UserDto => {
    const client: Socket = ctx.switchToWs().getClient<Socket>();
    return client.data.user;
  },
);
