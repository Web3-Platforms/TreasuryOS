import { Inject, Injectable } from '@nestjs/common';
import type { SessionRecord } from '@treasuryos/types';

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

function mapSessionRow(row: Record<string, unknown>): SessionRecord {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    tokenId: String(row.token_id),
    createdAt: toIso(row.created_at) ?? new Date().toISOString(),
    expiresAt: toIso(row.expires_at) ?? new Date().toISOString(),
    lastSeenAt: toIso(row.last_seen_at) ?? new Date().toISOString(),
    ipAddress: row.ip_address ? String(row.ip_address) : undefined,
    userAgent: row.user_agent ? String(row.user_agent) : undefined,
    revokedAt: toIso(row.revoked_at),
  };
}

@Injectable()
export class SessionsRepository {
  constructor(@Inject(DatabaseService) private readonly database: DatabaseService) {}

  async findById(sessionId: string): Promise<SessionRecord | undefined> {
    const result = await this.database.pool.query(
      `
        select id, user_id, token_id, created_at, expires_at, last_seen_at, ip_address, user_agent, revoked_at
        from auth_sessions
        where id = $1
        limit 1
      `,
      [sessionId],
    );

    return result.rows[0] ? mapSessionRow(result.rows[0] as Record<string, unknown>) : undefined;
  }

  async findActiveByUserId(userId: string): Promise<SessionRecord[]> {
    const result = await this.database.pool.query(
      `
        select id, user_id, token_id, created_at, expires_at, last_seen_at, ip_address, user_agent, revoked_at
        from auth_sessions
        where user_id = $1 and revoked_at is null and expires_at > now()
        order by created_at desc
      `,
      [userId],
    );

    return result.rows.map((row) => mapSessionRow(row as Record<string, unknown>));
  }

  async save(session: SessionRecord): Promise<SessionRecord> {
    await this.database.pool.query(
      `
        insert into auth_sessions (
          id,
          user_id,
          token_id,
          created_at,
          expires_at,
          last_seen_at,
          ip_address,
          user_agent,
          revoked_at
        )
        values ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        on conflict (id) do update
        set
          user_id = excluded.user_id,
          token_id = excluded.token_id,
          created_at = excluded.created_at,
          expires_at = excluded.expires_at,
          last_seen_at = excluded.last_seen_at,
          ip_address = excluded.ip_address,
          user_agent = excluded.user_agent,
          revoked_at = excluded.revoked_at
      `,
      [
        session.id,
        session.userId,
        session.tokenId,
        session.createdAt,
        session.expiresAt,
        session.lastSeenAt,
        session.ipAddress ?? null,
        session.userAgent ?? null,
        session.revokedAt ?? null,
      ],
    );

    return session;
  }
}
