import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  integer,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { userAccountEnum } from './enums';
import { primaryUuidId, timestampColumns } from './common-columns';

export const users = pgTable(
  'users',
  {
    ...primaryUuidId,
    username: text('username').notNull().unique(),
    email: text('email'),
    lastLogout: timestamp('last_logout', { withTimezone: true }),
    lastLogin: timestamp('last_login', { withTimezone: true }),
    password: text('password').notNull(),
    profileId: uuid('profile_id').notNull(),
    emailVerified: boolean('email_verified').notNull().default(false),
    faEnabled: boolean('fa_enabled').notNull().default(false),
    nonce: integer('nonce').notNull().default(0),
    futureClientSeed: text('future_client_seed'),
    futureServerSeed: text('future_server_seed'),
    futureServerSeedHash: text('future_server_seed_hash'),
    activeSeedId: uuid('active_seed_id'),
    userAccounts: text('user_accounts').array().notNull().default(['user']),
    emailVerificationToken: text('email_verification_token').unique(),
    emailVerificationTokenExpires: timestamp(
      'email_verification_token_expires',
      {
        withTimezone: true,
      },
    ),
    emailVerificationResendCount: integer(
      'email_verification_resend_count',
    ).default(0),
    ...timestampColumns,
  },
  (t) => [
    uniqueIndex('users_username_idx').on(t.username),
    uniqueIndex('users_email_idx').on(t.email),
  ],
);

export type UserSelect = typeof users.$inferSelect;
export type UserInsert = typeof users.$inferInsert;
