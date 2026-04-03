import { Inject, Injectable } from '@nestjs/common';
import type { AiAdvisoryFeedbackRecord } from '@treasuryos/types';
import type { PoolClient } from 'pg';

import { toIso } from '../../common/db-utils.js';
import { DatabaseService } from '../database/database.service.js';

function mapAiFeedbackRow(row: Record<string, unknown>): AiAdvisoryFeedbackRecord {
  return {
    id: String(row.id),
    advisoryId: String(row.advisory_id),
    advisoryModel: String(row.advisory_model),
    advisoryPromptVersion: String(row.advisory_prompt_version),
    advisoryProvider: String(row.advisory_provider) as AiAdvisoryFeedbackRecord['advisoryProvider'],
    advisorySourceHash: String(row.advisory_source_hash),
    advisoryType: String(row.advisory_type) as AiAdvisoryFeedbackRecord['advisoryType'],
    actorEmail: String(row.actor_email),
    actorId: String(row.actor_id),
    createdAt: toIso(row.created_at) ?? new Date().toISOString(),
    disposition: String(row.disposition) as AiAdvisoryFeedbackRecord['disposition'],
    helpfulness: String(row.helpfulness) as AiAdvisoryFeedbackRecord['helpfulness'],
    note: row.note ? String(row.note) : undefined,
    resourceId: String(row.resource_id),
    resourceType: String(row.resource_type) as AiAdvisoryFeedbackRecord['resourceType'],
    updatedAt: toIso(row.updated_at) ?? new Date().toISOString(),
  };
}

@Injectable()
export class AiFeedbackRepository {
  constructor(@Inject(DatabaseService) private readonly database: DatabaseService) {}

  async save(feedback: AiAdvisoryFeedbackRecord, client?: PoolClient): Promise<AiAdvisoryFeedbackRecord> {
    const executor = client ?? this.database.pool;
    const result = await executor.query(
      `
        insert into ai_feedback (
          id,
          advisory_id,
          advisory_type,
          resource_type,
          resource_id,
          actor_id,
          actor_email,
          helpfulness,
          disposition,
          note,
          advisory_source_hash,
          advisory_provider,
          advisory_model,
          advisory_prompt_version,
          created_at,
          updated_at
        )
        values (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16
        )
        on conflict (
          advisory_id,
          actor_id,
          advisory_source_hash,
          advisory_provider,
          advisory_model,
          advisory_prompt_version
        ) do update
        set
          helpfulness = excluded.helpfulness,
          disposition = excluded.disposition,
          note = excluded.note,
          updated_at = excluded.updated_at
        returning
          id,
          advisory_id,
          advisory_type,
          resource_type,
          resource_id,
          actor_id,
          actor_email,
          helpfulness,
          disposition,
          note,
          advisory_source_hash,
          advisory_provider,
          advisory_model,
          advisory_prompt_version,
          created_at,
          updated_at
      `,
      [
        feedback.id,
        feedback.advisoryId,
        feedback.advisoryType,
        feedback.resourceType,
        feedback.resourceId,
        feedback.actorId,
        feedback.actorEmail,
        feedback.helpfulness,
        feedback.disposition,
        feedback.note ?? null,
        feedback.advisorySourceHash,
        feedback.advisoryProvider,
        feedback.advisoryModel,
        feedback.advisoryPromptVersion,
        feedback.createdAt,
        feedback.updatedAt,
      ],
    );

    return mapAiFeedbackRow(result.rows[0] as Record<string, unknown>);
  }
}
