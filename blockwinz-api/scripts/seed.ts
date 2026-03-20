/**
 * Standalone DB seed (Drizzle + dotenv). Not run inside NestJS.
 *
 * - Default admin when DEFAULT_ADMIN_EMAIL is set (idempotent).
 * - General chat room `general` (idempotent).
 *
 * Env: DATABASE_URL, or POSTGRES_* fallbacks (see getConnectionString).
 * Run: pnpm seed (from repo root or blockwinz-api)
 */
import 'dotenv/config';
import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';
import { Pool } from 'pg';
import * as schema from '../src/database/schema';

type Database = NodePgDatabase<typeof schema>;

function getConnectionString(): string {
  const url = process.env.DATABASE_URL;
  if (url) return url;
  const user = process.env.POSTGRES_USER ?? 'postgres';
  const password = process.env.POSTGRES_PASSWORD ?? '';
  const host = process.env.POSTGRES_HOST ?? 'localhost';
  const port = process.env.DATABASE_PORT ?? '5432';
  const db = process.env.POSTGRES_DB ?? 'blockwinz';
  return `postgresql://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}:${port}/${db}`;
}

async function seedDefaultAdmin(db: Database): Promise<void> {
  const email = process.env.DEFAULT_ADMIN_EMAIL;
  if (!email) {
    console.log('DEFAULT_ADMIN_EMAIL not set; skipping admin seed.');
    return;
  }

  const [existing] = await db
    .select()
    .from(schema.admins)
    .where(eq(schema.admins.email, email))
    .limit(1);

  if (existing) {
    console.log('Default admin already exists, skipping.');
    return;
  }

  await db.insert(schema.admins).values({
    email,
    isVerified: true,
    isActive: true,
    role: 'super_admin',
    createdBy: 'system',
    updatedBy: 'system',
    lastLogin: new Date(),
    failedLoginAttempts: 0,
    twoFactorEnabled: false,
  } as typeof schema.admins.$inferInsert);
  console.log('Default admin created successfully.');
}

const GENERAL_ROOM_NAME = 'general';

async function seedGeneralRoom(db: Database): Promise<void> {
  const [existing] = await db
    .select()
    .from(schema.rooms)
    .where(eq(schema.rooms.name, GENERAL_ROOM_NAME))
    .limit(1);

  if (existing) {
    console.log('General room already exists, skipping.');
    return;
  }

  await db.insert(schema.rooms).values({
    name: GENERAL_ROOM_NAME,
    isActive: true,
    isPrivate: false,
    members: [],
  } as typeof schema.rooms.$inferInsert);
  console.log('General room created successfully.');
}

async function seed() {
  const connectionString = getConnectionString();

  const pool = new Pool({
    connectionString,
    max: 5,
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 10_000,
  });

  const db = drizzle(pool, { schema });

  try {
    await seedDefaultAdmin(db);
    await seedGeneralRoom(db);
    console.log('Seed complete.');
  } finally {
    await pool.end();
  }

  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
