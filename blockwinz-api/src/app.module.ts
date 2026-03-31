import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { RedisModule } from '@nestjs-modules/ioredis';

// Services
import { AppService } from './app.service';

// Custom modules
import { TransactionModule } from './transaction/transaction.module';
import { NeoCoreModule } from './core/neoCore/neoCore.module';
import { SeedsModule } from './core/seeds /seeds.module';
import { GamesModule } from './games/games.module';
import { QueueModule } from './core/queue/queue.module';
import { BullModule } from '@nestjs/bull';
import { WalletModule } from './wallet/wallet.module';
import { AuthenticationModule } from './authentication/authentication.module';
import { BetHistoryModule } from './betHistory/betHistory.module';
import { SolanaCoreModule } from './core/solanaCore/solanaCore.module';
import { SettingsModule } from './settings/settings.module';
import { ReferralModule } from './referral/referral.module';
import { EmailModule } from './email/email.module';
import { CouponModule } from './coupon/coupon.module';
import { PricesModule } from './prices/prices.module';
import { MultiplayerModule } from './multiplayer/multiplayer.module';

// Interceptors
import { CustomCacheInterceptor } from './shared/interceptors/cache.interceptor';

// Controllers
import { AppController } from './app.controller';

// Guards
import { APP_GUARD } from '@nestjs/core';
import { WithdrawalModule } from './withdrawal/withdrawal.module';
import { AuthenticationGuard } from './shared/guards/authentication.guard';
import { UserMiddleware } from './shared/middlewares/user.middleware';
import { ChatModule } from './chat/chat.module';
import { JwtModule } from '@nestjs/jwt';
import { ScheduleModule } from '@nestjs/schedule';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { DatabaseModule } from './database/database.module';

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function validateServerEnvironment(): void {
  requireEnv('JWT_SECRET');
  const hasDatabaseUrl = Boolean(process.env.DATABASE_URL?.trim());
  const hasDiscreteDbConfig =
    Boolean(process.env.POSTGRES_HOST?.trim()) &&
    Boolean(process.env.POSTGRES_DB?.trim()) &&
    Boolean(process.env.POSTGRES_USER?.trim());
  if (!hasDatabaseUrl && !hasDiscreteDbConfig) {
    throw new Error(
      'Database configuration is required via DATABASE_URL or POSTGRES_HOST/POSTGRES_DB/POSTGRES_USER',
    );
  }
}

validateServerEnvironment();

const redisUrl = process.env.REDIS_URL?.trim() || 'redis://localhost:6379';

const controllers = [AppController];

const customModules = [
  AuthenticationModule,
  NeoCoreModule,
  TransactionModule,
  WalletModule,
  SeedsModule,
  GamesModule,
  QueueModule,
  BetHistoryModule,
  SolanaCoreModule,
  SettingsModule,
  ReferralModule,
  EmailModule,
  CouponModule,
  WithdrawalModule,
  ChatModule,
  PricesModule,
  MultiplayerModule,
];

const providers = [AppService, CustomCacheInterceptor];

@Module({
  imports: [
    BullModule.forRoot({
      redis: redisUrl,
      settings: {
        stalledInterval: 30000, // check for stalled jobs every 30s
        maxStalledCount: 3, // fail a job after 3 stalled restarts
      },
    }),
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    CacheModule.register({
      isGlobal: true,
      ttl: 60 * 1000, // Cache for 1 minute
      max: 100, // Maximum number of items in cache
    }),
    RedisModule.forRoot({
      type: 'single',
      url: redisUrl,
    }),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '7d' },
    }),
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot(),
    ...customModules,
  ],
  controllers: [...controllers],
  providers: [
    ...providers,
    {
      provide: APP_GUARD,
      useClass: AuthenticationGuard,
    },
  ],
  exports: [...customModules],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(UserMiddleware)
      // wildcard for all routes
      .forRoutes('*');
  }
}
