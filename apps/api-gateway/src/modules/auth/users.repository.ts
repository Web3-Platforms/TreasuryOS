import { Inject, Injectable } from '@nestjs/common';
import type { UserRecord, UserRole, UserStatus } from '@treasuryos/types';

import { DatabaseService } from '../database/database.service.js';

function toIso(value: unknown) {
  if (!value) {
    return undefined;
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  const parsed = new Date(String(value));
  return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString();
}

function asStringArray(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.map((entry) => String(entry));
}

function mapUserRow(row: Record<string, unknown>): UserRecord {
  const roles = asStringArray(row.roles);

  return {
    id: String(row.id),
    email: String(row.email),
    displayName: String(row.display_name),
    roles: (roles.length > 0 ? roles : [String(row.role)]) as UserRole[],
    status: String(row.status) as UserStatus,
    passwordSalt: String(row.password_salt ?? ''),
    passwordHash: String(row.password_hash ?? ''),
    createdAt: toIso(row.created_at) ?? new Date().toISOString(),
    lastLoginAt: toIso(row.last_login_at),
  };
}

@Injectable()
export class UsersRepository {
  constructor(@Inject(DatabaseService) private readonly database: DatabaseService) {}

  async findByEmail(email: string): Promise<UserRecord | undefined> {
    const normalized = email.trim().toLowerCase();
    const result = await this.database.pool.query(
      `
        select id, email, role, display_name, roles, status, password_salt, password_hash, created_at, last_login_at
        from app_users
        where lower(email) = $1
        limit 1
      `,
      [normalized],
    );

    return result.rows[0] ? mapUserRow(result.rows[0] as Record<string, unknown>) : undefined;
  }

  async findById(userId: string): Promise<UserRecord | undefined> {
    const result = await this.database.pool.query(
      `
        select id, email, role, display_name, roles, status, password_salt, password_hash, created_at, last_login_at
        from app_users
        where id = $1
        limit 1
      `,
      [userId],
    );

    return result.rows[0] ? mapUserRow(result.rows[0] as Record<string, unknown>) : undefined;
  }

  async updateLastLoginAt(userId: string, lastLoginAt: string): Promise<void> {
    await this.database.pool.query(
      `
        update app_users
        set last_login_at = $2
        where id = $1
      `,
      [userId, lastLoginAt],
    );
  }
}
