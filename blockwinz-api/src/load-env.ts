import { existsSync } from 'fs';
import { config } from 'dotenv';
import { resolve } from 'path';

/**
 * Loads `blockwinz-api/.env` before any other module reads `process.env`.
 * `app.module.ts` validates required vars at import time, before `ConfigModule.forRoot` runs.
 *
 * Nest emits compiled files under `dist/src/`, so `../.env` from there would wrongly target `dist/.env`.
 */
function resolveEnvPath(): string | undefined {
  const nextToFile = resolve(__dirname, '../.env');
  if (existsSync(nextToFile)) {
    return nextToFile;
  }
  const fromDistSrc = resolve(__dirname, '../../.env');
  if (existsSync(fromDistSrc)) {
    return fromDistSrc;
  }
  const cwdEnv = resolve(process.cwd(), '.env');
  if (existsSync(cwdEnv)) {
    return cwdEnv;
  }
  return undefined;
}

const envPath = resolveEnvPath();
if (envPath) {
  config({ path: envPath });
} else {
  config();
}
