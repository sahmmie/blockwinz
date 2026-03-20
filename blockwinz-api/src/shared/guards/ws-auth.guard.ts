import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { AuthenticationRepository } from 'src/authentication/repositories/authentication.repository';

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

      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });

      // Http request to get user profile
      const user = await this.authenticationRepository.findUserWithProfile(
        payload._id,
      );
      if (!user) {
        throw new WsException('User not found');
      }

      // Attach the user to the socket for later use
      client.data.user = user;
      return true;
    } catch (error) {
      client.emit('error', { message: error.message });
      throw new WsException('Unauthorized - Invalid token');
    }
  }

  private extractTokenFromHeader(client: Socket): string | undefined {
    return client.handshake.auth?.token;
  }
}
