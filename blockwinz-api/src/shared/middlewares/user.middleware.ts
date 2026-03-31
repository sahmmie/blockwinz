import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { extractTokenFromHeader } from 'src/shared/helpers/utils-functions.helper';
import { AuthenticationRepository } from 'src/authentication/repositories/authentication.repository';
import { AdminAuthRepository } from 'src/authentication/repositories/admin-auth.repository';
import { getUserId } from 'src/shared/helpers/user.helper';
import { PosthogService } from 'src/posthog/posthog.service';

@Injectable()
export class UserMiddleware implements NestMiddleware {
  constructor(
    private configService: ConfigService,
    private authenticationRepository: AuthenticationRepository,
    private adminAuthRepository: AdminAuthRepository,
    private readonly posthogService: PosthogService,
  ) {}

  /**
   * Hydrates the authenticated user from the JWT and stores lightweight analytics context on the request.
   */
  async use(req: Request, res: Response, next: NextFunction) {
    const token = extractTokenFromHeader(req);
    if (!token) return next();

    try {
      const decoded = jwt.verify(
        token,
        this.configService.get<string>('JWT_SECRET'),
      ) as { _id?: string; sub?: string; isAdmin?: boolean };

      const userId = decoded._id ?? decoded.sub;

      if (!userId) {
        throw new UnauthorizedException('Invalid token payload.');
      }

      if (decoded.isAdmin) {
        const admin = await this.adminAuthRepository.findAdminById(userId);
        if (!admin || !admin.isActive) {
          throw new UnauthorizedException('Invalid or inactive admin.');
        }
        req['user'] = admin;
        req['isAdmin'] = true;
        req['posthogDistinctId'] = getUserId(admin);
      } else {
        const user =
          await this.authenticationRepository.findUserWithProfile(userId);
        if (!user) {
          throw new UnauthorizedException('Invalid user.');
        }
        req['user'] = user;
        req['isAdmin'] = false;
        req['posthogDistinctId'] = getUserId(user);
        this.posthogService.identifyUser(user);
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'TokenExpiredError') {
        throw new UnauthorizedException(
          'Session expired. Please log in again.',
        );
      }
      throw new UnauthorizedException(
        'Unauthorized! Authentication required(M)',
      );
    }

    next();
  }
}
