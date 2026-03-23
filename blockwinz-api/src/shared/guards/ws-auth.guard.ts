import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { isAfter, toDate } from 'date-fns';
import { AuthenticationRepository } from 'src/authentication/repositories/authentication.repository';

type AccessPayload = { _id?: string; sub?: string; iat?: number };

@Injectable()
export class WsAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    protected readonly authenticationRepository: AuthenticationRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client: Socket = context.switchToWs().getClient<Socket>();
    try {
      const token = this.extractTokenFromHeader(client);

      if (!token) {
        throw new WsException('Unauthorized - No token provided');
      }

      const secret = process.env.JWT_SECRET;
      if (!secret) {
        throw new WsException('Server misconfiguration');
      }

      const payload = (await this.jwtService.verifyAsync(token, {
        secret,
      })) as AccessPayload;

      const userId = payload._id ?? payload.sub;
      if (!userId) {
        throw new WsException('Invalid token payload');
      }

      if (payload.iat == null) {
        throw new WsException('Invalid token');
      }

      const user =
        await this.authenticationRepository.findUserWithProfile(userId);
      if (!user) {
        throw new WsException('User not found');
      }

      if (
        user.lastLogout != null &&
        isAfter(toDate(user.lastLogout), toDate(payload.iat * 1000))
      ) {
        throw new WsException('Session ended. Please sign in again.');
      }

      client.data.user = user;
      return true;
    } catch (error) {
      if (error instanceof WsException) {
        throw error;
      }
      const message =
        error instanceof Error ? error.message : 'Unauthorized - Invalid token';
      client.emit('error', { message });
      throw new WsException('Unauthorized - Invalid token');
    }
  }

  private extractTokenFromHeader(client: Socket): string | undefined {
    return client.handshake.auth?.token;
  }
}
