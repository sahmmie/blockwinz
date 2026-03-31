import { Test, TestingModule } from '@nestjs/testing';
import { AuthenticationController } from './authentication.controller';
import { AuthenticationRepository } from '../repositories/authentication.repository';
import { EmailService } from 'src/email/email.service';
import { OTPRepository } from '../repositories/otp.repository';
import { RefreshTokenService } from '../services/refresh-token.service';
import { RateLimitGuard } from 'src/shared/guards/rateLimit.guard';

describe('AuthenticationController', () => {
  let controller: AuthenticationController;

  const authenticationRepository = {
    logoutAccount: jest.fn().mockResolvedValue({
      message: 'Logged out successfully',
      status: 'success',
    }),
  };
  const refreshTokenService = {
    validateRequestOrigin: jest.fn(),
    revokeFromRequest: jest.fn().mockResolvedValue(undefined),
    clearCookie: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthenticationController],
      providers: [
        { provide: AuthenticationRepository, useValue: authenticationRepository },
        { provide: EmailService, useValue: {} },
        { provide: OTPRepository, useValue: {} },
        { provide: RefreshTokenService, useValue: refreshTokenService },
      ],
    })
      .overrideGuard(RateLimitGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get(AuthenticationController);
  });

  it('userLogout validates origin and revokes the refresh session', async () => {
    const req = {} as never;
    const res = {} as never;
    const user = { _id: 'user-1' } as never;

    const result = await controller.userLogout(user, req, res);

    expect(refreshTokenService.validateRequestOrigin).toHaveBeenCalledWith(req);
    expect(refreshTokenService.revokeFromRequest).toHaveBeenCalledWith(req);
    expect(refreshTokenService.clearCookie).toHaveBeenCalledWith(res);
    expect(authenticationRepository.logoutAccount).toHaveBeenCalledWith(user);
    expect(result).toEqual({
      message: 'Logged out successfully',
      status: 'success',
    });
  });
});
