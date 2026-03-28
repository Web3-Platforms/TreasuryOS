import { Inject, Injectable } from '@nestjs/common';
import type { AuditEventRecord } from '@treasuryos/types';

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

function asJsonRecord(value: unknown): Record<string, unknown> | undefined {
  if (!value) {
    return undefined;
  }
  if (typeof value === 'string') {
    try {
      return JSON.parse(value) as Record<string, unknown>;
    } catch {
      return undefined;
    }
  }
  if (typeof value === 'object') {
    return value as Record<string, unknown>;
  }
  return undefined;
}

function mapAuditEventRow(row: Record<string, unknown>): AuditEventRecord {
  return {
    id: String(row.id),
    actorId: String(row.actor_id),
    actorEmail: String(row.actor_email),
    action: String(row.action),
    resourceType: String(row.resource_type),
    resourceId: String(row.resource_id),
    summary: String(row.summary),
    metadata: asJsonRecord(row.metadata),
    createdAt: toIso(row.created_at) ?? new Date().toISOString(),
  };
}

@Injectable()
export class AuditRepository {
  constructor(@Inject(DatabaseService) private readonly database: DatabaseService) {}

  async insert(event: AuditEventRecord): Promise<AuditEventRecord> {
    await this.database.pool.query(
      `
        insert into audit_events (
          id,
          actor_id,
          actor_email,
          action,
          resource_type,
          resource_id,
          summary,
          metadata,
          created_at
        )
        values ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9)
      `,
      [
        event.id,
        event.actorId,
        event.actorEmail,
        event.action,
        event.resourceType,
        event.resourceId,
        event.summary,
        JSON.stringify(event.metadata ?? {}),
        event.createdAt,
      ],
    );

    return event;
  }

  async listRecent(limit: number): Promise<AuditEventRecord[]> {
    const result = await this.database.pool.query(
      `
        select id, actor_id, actor_email, action, resource_type, resource_id, summary, metadata, created_at
        from audit_events
        order by created_at desc
        limit $1
      `,
      [limit],
    );

    return result.rows.map((row) => mapAuditEventRow(row as Record<string, unknown>));
  }
}
