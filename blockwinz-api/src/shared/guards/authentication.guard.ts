import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { isAfter, toDate } from 'date-fns';
import { UserDto } from 'src/shared/dtos/user.dto';
import * as jwt from 'jsonwebtoken';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from 'src/shared/decorators/publicApi.decorator';
import { extractTokenFromHeader } from 'src/shared/helpers/utils-functions.helper';

@Injectable()
export class AuthenticationGuard implements CanActivate {
  constructor(
    @Inject(ConfigService) public config: ConfigService,
    private reflector: Reflector,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const host = context.switchToHttp(),
      request: Request = host.getRequest();

    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const user: UserDto = request['user'];
    const authJwtToken = extractTokenFromHeader(request);
    try {
      const decodedToken: { _id: string; iat: number; exp: number } =
        jwt.verify(authJwtToken, this.config.get('JWT_SECRET')) as any;
      if (!user) {
        throw new UnauthorizedException('User not Authenticated');
      }
      if (isAfter(toDate(user.lastLogout), toDate(decodedToken.iat * 1000))) {
        throw new UnauthorizedException('Invalid Authorization Token(G)');
      }
    } catch (err) {
      throw new UnauthorizedException(
        'Unauthorized! Authentication required(G)',
      );
    }
    return true;
  }
}
