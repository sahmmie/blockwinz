import { join } from 'path';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';

/**
 * Resolves the Drizzle migrations folder next to the Nest `dist` output.
 * Compiled entry lives under `dist/src/database/`; Nest copies SQL under `dist/database/migrations`.
 */
function migrationsFolderPath(): string {
  return join(__dirname, '..', '..', 'database', 'migrations');
}

/**
 * Applies pending SQL migrations using `drizzle-orm` (no `drizzle-kit` CLI).
 * Intended to run after `nest build` and before `node dist/src/main`, including in production images where devDependencies are omitted.
 *
 * @throws {Error} When `DATABASE_URL` is unset.
 */
async function runMigrations(): Promise<void> {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is required to run migrations');
  }

  const migrationsFolder = migrationsFolderPath();
  const pool = new Pool({ connectionString: databaseUrl });
  const db = drizzle(pool);

  try {
    await migrate(db, { migrationsFolder });
  } finally {
    await pool.end();
  }
}

runMigrations().catch((err: unknown) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
