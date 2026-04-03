import { Inject, Injectable } from '@nestjs/common';
import type { AiAdvisoryRecord, AiAdvisoryResourceType, AiAdvisoryType } from '@treasuryos/types';
import type { PoolClient } from 'pg';

import { asStringArray, toIso } from '../../common/db-utils.js';
import { DatabaseService } from '../database/database.service.js';

function mapAiAdvisoryRow(row: Record<string, unknown>): AiAdvisoryRecord {
  return {
    id: String(row.id),
    advisoryType: String(row.advisory_type) as AiAdvisoryType,
    resourceType: String(row.resource_type) as AiAdvisoryResourceType,
    resourceId: String(row.resource_id),
    summary: String(row.summary),
    recommendation: row.recommendation ? String(row.recommendation) : undefined,
    riskFactors: asStringArray(row.risk_factors),
    checklist: asStringArray(row.checklist),
    confidence:
      row.confidence === null || row.confidence === undefined ? undefined : Number(row.confidence),
    model: String(row.model),
    provider: String(row.provider) as AiAdvisoryRecord['provider'],
    promptVersion: String(row.prompt_version),
    fallbackUsed: Boolean(row.fallback_used),
    providerLatencyMs:
      row.provider_latency_ms === null || row.provider_latency_ms === undefined
        ? undefined
        : Number(row.provider_latency_ms),
    redactionProfile: String(row.redaction_profile),
    sourceHash: String(row.source_hash),
    generatedAt: toIso(row.created_at) ?? new Date().toISOString(),
    updatedAt: toIso(row.updated_at) ?? new Date().toISOString(),
  };
}

@Injectable()
export class AiAdvisoriesRepository {
  constructor(@Inject(DatabaseService) private readonly database: DatabaseService) {}

  async findByResource(
    input: {
      advisoryType: AiAdvisoryType;
      resourceId: string;
      resourceType: AiAdvisoryResourceType;
    },
    client?: PoolClient,
  ): Promise<AiAdvisoryRecord | undefined> {
    const executor = client ?? this.database.pool;
    const result = await executor.query(
      `
        select
          id,
          advisory_type,
          resource_type,
          resource_id,
          summary,
          recommendation,
          risk_factors,
          checklist,
          confidence,
          model,
          provider,
          prompt_version,
          fallback_used,
          provider_latency_ms,
          redaction_profile,
          source_hash,
          created_at,
          updated_at
        from ai_advisories
        where advisory_type = $1 and resource_type = $2 and resource_id = $3
        order by updated_at desc
        limit 1
      `,
      [input.advisoryType, input.resourceType, input.resourceId],
    );

    return result.rows[0]
      ? mapAiAdvisoryRow(result.rows[0] as Record<string, unknown>)
      : undefined;
  }

  async findById(id: string, client?: PoolClient): Promise<AiAdvisoryRecord | undefined> {
    const executor = client ?? this.database.pool;
    const result = await executor.query(
      `
        select
          id,
          advisory_type,
          resource_type,
          resource_id,
          summary,
          recommendation,
          risk_factors,
          checklist,
          confidence,
          model,
          provider,
          prompt_version,
          fallback_used,
          provider_latency_ms,
          redaction_profile,
          source_hash,
          created_at,
          updated_at
        from ai_advisories
        where id = $1
        limit 1
      `,
      [id],
    );

    return result.rows[0]
      ? mapAiAdvisoryRow(result.rows[0] as Record<string, unknown>)
      : undefined;
  }

  async save(advisory: AiAdvisoryRecord, client?: PoolClient): Promise<AiAdvisoryRecord> {
    const executor = client ?? this.database.pool;
    const result = await executor.query(
      `
        insert into ai_advisories (
          id,
          advisory_type,
          resource_type,
          resource_id,
          summary,
          recommendation,
          risk_factors,
          checklist,
          confidence,
          model,
          provider,
          prompt_version,
          fallback_used,
          provider_latency_ms,
          redaction_profile,
          source_hash,
          created_at,
          updated_at
        )
        values (
          $1, $2, $3, $4, $5, $6, $7::text[], $8::text[], $9, $10, $11, $12, $13, $14, $15, $16, $17, $18
        )
        on conflict (advisory_type, resource_type, resource_id) do update
        set
          summary = excluded.summary,
          recommendation = excluded.recommendation,
          risk_factors = excluded.risk_factors,
          checklist = excluded.checklist,
          confidence = excluded.confidence,
          model = excluded.model,
          provider = excluded.provider,
          prompt_version = excluded.prompt_version,
          fallback_used = excluded.fallback_used,
          provider_latency_ms = excluded.provider_latency_ms,
          redaction_profile = excluded.redaction_profile,
          source_hash = excluded.source_hash,
          created_at = excluded.created_at,
          updated_at = excluded.updated_at
        returning
          id,
          advisory_type,
          resource_type,
          resource_id,
          summary,
          recommendation,
          risk_factors,
          checklist,
          confidence,
          model,
          provider,
          prompt_version,
          fallback_used,
          provider_latency_ms,
          redaction_profile,
          source_hash,
          created_at,
          updated_at
      `,
      [
        advisory.id,
        advisory.advisoryType,
        advisory.resourceType,
        advisory.resourceId,
        advisory.summary,
        advisory.recommendation ?? null,
        advisory.riskFactors,
        advisory.checklist,
        advisory.confidence ?? null,
        advisory.model,
        advisory.provider,
        advisory.promptVersion,
        advisory.fallbackUsed,
        advisory.providerLatencyMs ?? null,
        advisory.redactionProfile,
        advisory.sourceHash,
        advisory.generatedAt,
        advisory.updatedAt,
      ],
    );

    return mapAiAdvisoryRow(result.rows[0] as Record<string, unknown>);
  }
}
