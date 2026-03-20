import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';
import { DRIZZLE } from './constants';

export type DrizzleDb = ReturnType<typeof drizzle<typeof schema>>;

@Global()
@Module({
  providers: [
    {
      provide: DRIZZLE,
      inject: [ConfigService],
      useFactory: (configService: ConfigService): DrizzleDb => {
        let connectionString = configService.get<string>('DATABASE_URL');
        if (!connectionString) {
          const user = configService.get<string>('POSTGRES_USER') ?? 'postgres';
          const password = configService.get<string>('POSTGRES_PASSWORD') ?? '';
          const host =
            configService.get<string>('POSTGRES_HOST') ?? 'localhost';
          const port = configService.get<string>('DATABASE_PORT') ?? '5432';
          const db = configService.get<string>('POSTGRES_DB') ?? 'blockwinz';
          connectionString = `postgresql://${user}:${password}@${host}:${port}/${db}`;
        }
        const pool = new Pool({
          connectionString,
          max: 20,
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 10000,
        });
        return drizzle(pool, { schema });
      },
    },
  ],
  exports: [DRIZZLE],
})
export class DatabaseModule {}
