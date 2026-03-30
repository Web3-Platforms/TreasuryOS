var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { Inject, Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service.js';
import { toIso, asStringArray } from '../../common/db-utils.js';
function mapEntityRow(row) {
    return {
        id: String(row.id),
        legalName: String(row.legal_name),
        jurisdiction: String(row.jurisdiction),
        status: String(row.status),
        kycStatus: String(row.kyc_status),
        riskLevel: String(row.risk_level),
        provider: String(row.provider),
        externalUserId: String(row.external_user_id),
        kycApplicantId: row.kyc_applicant_id ? String(row.kyc_applicant_id) : undefined,
        kycLevelName: row.kyc_level_name ? String(row.kyc_level_name) : undefined,
        kycCorrelationId: row.kyc_correlation_id ? String(row.kyc_correlation_id) : undefined,
        latestKycWebhookType: row.latest_kyc_webhook_type ? String(row.latest_kyc_webhook_type) : undefined,
        latestKycReviewAnswer: row.latest_kyc_review_answer
            ? String(row.latest_kyc_review_answer)
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
let EntitiesRepository = class EntitiesRepository {
    database;
    constructor(database) {
        this.database = database;
    }
    async listAll() {
        const result = await this.database.pool.query(`
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
      `);
        return result.rows.map((row) => mapEntityRow(row));
    }
    async findById(entityId, client) {
        const executor = client ?? this.database.pool;
        const result = await executor.query(`
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
      `, [entityId]);
        return result.rows[0] ? mapEntityRow(result.rows[0]) : undefined;
    }
    async findByExternalUserId(externalUserId, client) {
        const executor = client ?? this.database.pool;
        const result = await executor.query(`
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
      `, [externalUserId]);
        return result.rows[0] ? mapEntityRow(result.rows[0]) : undefined;
    }
    async findByKycApplicantId(kycApplicantId, client) {
        const executor = client ?? this.database.pool;
        const result = await executor.query(`
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
      `, [kycApplicantId]);
        return result.rows[0] ? mapEntityRow(result.rows[0]) : undefined;
    }
    async save(entity, client) {
        const executor = client ?? this.database.pool;
        await executor.query(`
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
      `, [
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
        ]);
        return entity;
    }
};
EntitiesRepository = __decorate([
    Injectable(),
    __param(0, Inject(DatabaseService)),
    __metadata("design:paramtypes", [DatabaseService])
], EntitiesRepository);
export { EntitiesRepository };
//# sourceMappingURL=entities.repository.js.map