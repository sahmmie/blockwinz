import './load-env';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationError } from '@nestjs/class-validator';
import { ValidationPipe } from '@nestjs/common';
import { FallbackExceptionFilter } from './shared/filters/fallback.filter';
import { HttpExceptionFilter } from './shared/filters/http.filter';
import { ValidationException } from './shared/filters/validation.exception';
import { ValidationFilter } from './shared/filters/validation.filter';
import compression from 'compression';
import helmet from 'helmet';
import { RedisIoAdapter } from './shared/adaptors/redisAdapter';
// Import version from package.json (requires resolveJsonModule in tsconfig.json)
import packageJson from '../package.json';
import { WsExceptionFilter } from './shared/filters/ws-exception.filter';
import { CORS_ORIGIN_WHITELIST } from './shared/constants/cors-origins.constant';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: CORS_ORIGIN_WHITELIST,
      credentials: true,
      preflightContinue: false,
      maxAge: 60,
      optionsSuccessStatus: 200,
    },
  });
  const appVersion = packageJson.version;
  app.enableShutdownHooks();
  app.setGlobalPrefix(`api`);
  app.use(cookieParser());
  app.useGlobalFilters(
    app.get(FallbackExceptionFilter),
    new HttpExceptionFilter(),
    new ValidationFilter(),
    new WsExceptionFilter(),
  );
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      skipMissingProperties: true,
      exceptionFactory: (errors: ValidationError[]) => {
        const messages = errors.map((error) => {
          return `${error.property} has wrong value ${
            error.value
          },${Object.values(error.constraints).join(', ')}`;
        });

        return new ValidationException(messages);
      },
    }),
  );

  app.use(compression());

  app.use(helmet());

  const enableSwagger =
    process.env.ENABLE_SWAGGER === 'true' ||
    process.env.NODE_ENV !== 'production';

  if (enableSwagger) {
    const config = new DocumentBuilder()
      .setTitle('BlockWinz API')
      .setDescription('BlockWinz API description V-' + appVersion)
      .setVersion(appVersion)
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: 'Enter JWT token',
          in: 'header',
        },
        'JWT-auth',
      )
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
      },
    });
  }

  const port = process.env.PORT || 3000;
  console.debug(`Initializing server on port: ${port}`);
  const redisIoAdapter = new RedisIoAdapter(app);
  await redisIoAdapter.connectToRedis();
  app.useWebSocketAdapter(redisIoAdapter);

  await app
    .listen(port)
    .then(() =>
      console.debug(`Server started on port: http://localhost:${port}`),
    );
}

bootstrap();
