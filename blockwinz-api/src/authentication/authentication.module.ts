import { AuthenticationController } from './controllers/authentication.controller';
import { forwardRef, Module } from '@nestjs/common';
import { AuthenticationRepository } from './repositories/authentication.repository';
import { SeedsModule } from 'src/core/seeds /seeds.module';
import { WalletModule } from 'src/wallet/wallet.module';
import { EmailModule } from 'src/email/email.module';
import { OTPRepository } from './repositories/otp.repository';
import { ConfigModule } from '@nestjs/config';
import { AdminAuthRepository } from './repositories/admin-auth.repository';
import { AdminAuthController } from './controllers/admin-auth.controller';
import { QueueModule } from 'src/core/queue/queue.module';

const controllers = [AuthenticationController, AdminAuthController];

const customModules = [SeedsModule, WalletModule, EmailModule, ConfigModule];

@Module({
  imports: [WalletModule, ...customModules, forwardRef(() => QueueModule)],
  controllers: [...controllers],
  providers: [
    AuthenticationRepository,
    OTPRepository,
    AdminAuthRepository,
  ],
  exports: [AuthenticationRepository, OTPRepository, AdminAuthRepository],
})
export class AuthenticationModule {}
