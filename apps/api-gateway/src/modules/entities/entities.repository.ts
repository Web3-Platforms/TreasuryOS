import { Inject, Injectable } from '@nestjs/common';
import { EntityStatus, KycStatus, RiskLevel, type EntityRecord } from '@treasuryos/types';

import { DatabaseService } from '../database/database.service.js';
import type { PoolClient } from 'pg';

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

function mapEntityRow(row: Record<string, unknown>): EntityRecord {
  return {
    id: String(row.id),
    legalName: String(row.legal_name),
    jurisdiction: String(row.jurisdiction) as EntityRecord['jurisdiction'],
    status: String(row.status) as EntityStatus,
    kycStatus: String(row.kyc_status) as KycStatus,
    riskLevel: String(row.risk_level) as RiskLevel,
    provider: String(row.provider) as EntityRecord['provider'],
    externalUserId: String(row.external_user_id),
    kycApplicantId: row.kyc_applicant_id ? String(row.kyc_applicant_id) : undefined,
    kycLevelName: row.kyc_level_name ? String(row.kyc_level_name) : undefined,
    kycCorrelationId: row.kyc_correlation_id ? String(row.kyc_correlation_id) : undefined,
    latestKycWebhookType: row.latest_kyc_webhook_type ? String(row.latest_kyc_webhook_type) : undefined,
    latestKycReviewAnswer: row.latest_kyc_review_answer
      ? (String(row.latest_kyc_review_answer) as 'GREEN' | 'RED')
      : undefined,
    lastKycEventAt: toIso(row.last_kyc_event_at),
    notes: row.notes ? String(row.notes) : undefined,
    wallets: asStringArray(row.wallet_ids),
    createdBy: String(row.created_by),
    submittedAt: toIso(row.submitted_at),
    reviewedAt: toIso(row.reviewed_at),
    lastUpdatedAt: toIso(row.updated_at) ?? new Date().toISOString(),
    createdAt: toIso(row.created_at) ?? new Date().toISOString(),
  };
}

@Injectable()
export class EntitiesRepository {
  constructor(@Inject(DatabaseService) private readonly database: DatabaseService) {}

  async listAll(): Promise<EntityRecord[]> {
    const result = await this.database.pool.query(
      `
        select
          e.id,
          e.legal_name,
          e.jurisdiction,
          e.status,
          e.kyc_status,
          e.risk_level,
          e.provider,
          e.external_user_id,
          e.kyc_applicant_id,
          e.kyc_level_name,
          e.kyc_correlation_id,
          e.latest_kyc_webhook_type,
          e.latest_kyc_review_answer,
          e.last_kyc_event_at,
          e.notes,
          e.created_by,
          e.submitted_at,
          e.reviewed_at,
          e.created_at,
          e.updated_at,
          coalesce(
            (
              select array_agg(w.id order by w.created_at)
              from wallets w
              where w.entity_id = e.id
            ),
            '{}'::text[]
          ) as wallet_ids
        from entities e
        order by e.updated_at desc
      `,
    );

    return result.rows.map((row) => mapEntityRow(row as Record<string, unknown>));
  }

  async findById(entityId: string, client?: PoolClient): Promise<EntityRecord | undefined> {
    const executor = client ?? this.database.pool;
    const result = await executor.query(
      `
        select
          e.id,
          e.legal_name,
          e.jurisdiction,
          e.status,
          e.kyc_status,
          e.risk_level,
          e.provider,
          e.external_user_id,
          e.kyc_applicant_id,
          e.kyc_level_name,
          e.kyc_correlation_id,
          e.latest_kyc_webhook_type,
          e.latest_kyc_review_answer,
          e.last_kyc_event_at,
          e.notes,
          e.created_by,
          e.submitted_at,
          e.reviewed_at,
          e.created_at,
          e.updated_at,
          coalesce(
            (
              select array_agg(w.id order by w.created_at)
              from wallets w
              where w.entity_id = e.id
            ),
            '{}'::text[]
          ) as wallet_ids
        from entities e
        where e.id = $1
      `,
      [entityId],
    );

    return result.rows[0] ? mapEntityRow(result.rows[0] as Record<string, unknown>) : undefined;
  }

  async findByExternalUserId(externalUserId: string, client?: PoolClient): Promise<EntityRecord | undefined> {
    const executor = client ?? this.database.pool;
    const result = await executor.query(
      `
        select
          e.id,
          e.legal_name,
          e.jurisdiction,
          e.status,
          e.kyc_status,
          e.risk_level,
          e.provider,
          e.external_user_id,
          e.kyc_applicant_id,
          e.kyc_level_name,
          e.kyc_correlation_id,
          e.latest_kyc_webhook_type,
          e.latest_kyc_review_answer,
          e.last_kyc_event_at,
          e.notes,
          e.created_by,
          e.submitted_at,
          e.reviewed_at,
          e.created_at,
          e.updated_at,
          coalesce(
            (
              select array_agg(w.id order by w.created_at)
              from wallets w
              where w.entity_id = e.id
            ),
            '{}'::text[]
          ) as wallet_ids
        from entities e
        where e.external_user_id = $1
      `,
      [externalUserId],
    );

    return result.rows[0] ? mapEntityRow(result.rows[0] as Record<string, unknown>) : undefined;
  }

  async findByKycApplicantId(kycApplicantId: string, client?: PoolClient): Promise<EntityRecord | undefined> {
    const executor = client ?? this.database.pool;
    const result = await executor.query(
      `
        select
          e.id,
          e.legal_name,
          e.jurisdiction,
          e.status,
          e.kyc_status,
          e.risk_level,
          e.provider,
          e.external_user_id,
          e.kyc_applicant_id,
          e.kyc_level_name,
          e.kyc_correlation_id,
          e.latest_kyc_webhook_type,
          e.latest_kyc_review_answer,
          e.last_kyc_event_at,
          e.notes,
          e.created_by,
          e.submitted_at,
          e.reviewed_at,
          e.created_at,
          e.updated_at,
          coalesce(
            (
              select array_agg(w.id order by w.created_at)
              from wallets w
              where w.entity_id = e.id
            ),
            '{}'::text[]
          ) as wallet_ids
        from entities e
        where e.kyc_applicant_id = $1
      `,
      [kycApplicantId],
    );

    return result.rows[0] ? mapEntityRow(result.rows[0] as Record<string, unknown>) : undefined;
  }

  async save(entity: EntityRecord, client?: PoolClient): Promise<EntityRecord> {
    const executor = client ?? this.database.pool;
    await executor.query(
      `
        insert into entities (
          id,
          legal_name,
          jurisdiction,
          status,
          kyc_status,
          risk_level,
          provider,
          external_user_id,
          kyc_applicant_id,
          kyc_level_name,
          kyc_correlation_id,
          latest_kyc_webhook_type,
          latest_kyc_review_answer,
          last_kyc_event_at,
          notes,
          created_by,
          submitted_at,
          reviewed_at,
          created_at,
          updated_at
        )
        values (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
          $11, $12, $13, $14, $15, $16, $17, $18, $19, $20
        )
        on conflict (id) do update
        set
          legal_name = excluded.legal_name,
          jurisdiction = excluded.jurisdiction,
          status = excluded.status,
          kyc_status = excluded.kyc_status,
          risk_level = excluded.risk_level,
          provider = excluded.provider,
          external_user_id = excluded.external_user_id,
          kyc_applicant_id = excluded.kyc_applicant_id,
          kyc_level_name = excluded.kyc_level_name,
          kyc_correlation_id = excluded.kyc_correlation_id,
          latest_kyc_webhook_type = excluded.latest_kyc_webhook_type,
          latest_kyc_review_answer = excluded.latest_kyc_review_answer,
          last_kyc_event_at = excluded.last_kyc_event_at,
          notes = excluded.notes,
          submitted_at = excluded.submitted_at,
          reviewed_at = excluded.reviewed_at,
          updated_at = excluded.updated_at
      `,
      [
        entity.id,
        entity.legalName,
        entity.jurisdiction,
        entity.status,
        entity.kycStatus,
        entity.riskLevel,
        entity.provider,
        entity.externalUserId,
        entity.kycApplicantId ?? null,
        entity.kycLevelName ?? null,
        entity.kycCorrelationId ?? null,
        entity.latestKycWebhookType ?? null,
        entity.latestKycReviewAnswer ?? null,
        entity.lastKycEventAt ?? null,
        entity.notes ?? null,
        entity.createdBy,
        entity.submittedAt ?? null,
        entity.reviewedAt ?? null,
        entity.createdAt,
        entity.lastUpdatedAt,
      ],
    );

    return entity;
  }
}
