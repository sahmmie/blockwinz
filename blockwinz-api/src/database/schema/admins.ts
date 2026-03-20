import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { primaryUuidId, timestampColumns } from './common-columns';
import { adminRoleEnum } from './enums';

export const admins = pgTable(
  'admins',
  {
    ...primaryUuidId,
    email: text('email').notNull().unique(),
    isVerified: boolean('is_verified').default(false),
    isActive: boolean('is_active').default(true),
    lastLogout: timestamp('last_logout', { withTimezone: true }),
    role: adminRoleEnum('role').notNull().default('admin'),
    lastLogin: timestamp('last_login', { withTimezone: true }),
    lastLoginIP: text('last_login_ip'),
    createdBy: text('created_by'),
    updatedBy: text('updated_by'),
    twoFactorEnabled: boolean('two_factor_enabled').default(false),
    twoFactorSecret: text('two_factor_secret'),
    failedLoginAttempts: integer('failed_login_attempts').default(0),
    lockUntil: timestamp('lock_until', { withTimezone: true }),
    ...timestampColumns,
  },
  (t) => [uniqueIndex('admins_email_idx').on(t.email)],
);

export type AdminSelect = typeof admins.$inferSelect;
export type AdminInsert = typeof admins.$inferInsert;
