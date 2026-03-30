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
import { toIso } from '../../common/db-utils.js';
function mapKycWebhookRow(row) {
    return {
        id: String(row.id),
        entityId: row.entity_id ? String(row.entity_id) : undefined,
        provider: String(row.provider),
        payloadType: String(row.payload_type),
        verified: Boolean(row.verified),
        createdAt: toIso(row.created_at) ?? new Date().toISOString(),
        applicantId: row.applicant_id ? String(row.applicant_id) : undefined,
        correlationId: row.correlation_id ? String(row.correlation_id) : undefined,
        digestAlg: row.digest_alg ? String(row.digest_alg) : undefined,
        eventCreatedAt: toIso(row.event_created_at),
        externalUserId: row.external_user_id ? String(row.external_user_id) : undefined,
        payloadDigest: row.payload_digest ? String(row.payload_digest) : undefined,
        reviewAnswer: row.review_answer ? String(row.review_answer) : undefined,
        reviewStatus: row.review_status ? String(row.review_status) : undefined,
    };
}
let KycWebhooksRepository = class KycWebhooksRepository {
    database;
    constructor(database) {
        this.database = database;
    }
    async findByDigest(digest, client) {
        const executor = client ?? this.database.pool;
        const result = await executor.query(`
        select
          id,
          entity_id,
          provider,
          payload_type,
          verified,
          created_at,
          applicant_id,
          correlation_id,
          digest_alg,
          event_created_at,
          external_user_id,
          payload_digest,
          review_answer,
          review_status
        from provider_webhooks
        where payload_digest = $1
        limit 1
      `, [digest]);
        return result.rows[0] ? mapKycWebhookRow(result.rows[0]) : undefined;
    }
    async findByCorrelationIdAndType(correlationId, payloadType, client) {
        const executor = client ?? this.database.pool;
        const result = await executor.query(`
        select
          id,
          entity_id,
          provider,
          payload_type,
          verified,
          created_at,
          applicant_id,
          correlation_id,
          digest_alg,
          event_created_at,
          external_user_id,
          payload_digest,
          review_answer,
          review_status
        from provider_webhooks
        where correlation_id = $1 and payload_type = $2
        limit 1
      `, [correlationId, payloadType]);
        return result.rows[0] ? mapKycWebhookRow(result.rows[0]) : undefined;
    }
    async save(webhook, client) {
        const executor = client ?? this.database.pool;
        await executor.query(`
        insert into provider_webhooks (
          id,
          entity_id,
          provider,
          payload_type,
          verified,
          digest_alg,
          created_at,
          applicant_id,
          correlation_id,
          event_created_at,
          external_user_id,
          payload_digest,
          review_answer,
          review_status
        )
        values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        on conflict (id) do update
        set
          entity_id = excluded.entity_id,
          provider = excluded.provider,
          payload_type = excluded.payload_type,
          verified = excluded.verified,
          digest_alg = excluded.digest_alg,
          applicant_id = excluded.applicant_id,
          correlation_id = excluded.correlation_id,
          event_created_at = excluded.event_created_at,
          external_user_id = excluded.external_user_id,
          payload_digest = excluded.payload_digest,
          review_answer = excluded.review_answer,
          review_status = excluded.review_status
      `, [
            webhook.id,
            webhook.entityId ?? null,
            webhook.provider,
            webhook.payloadType,
            webhook.verified,
            webhook.digestAlg ?? null,
            webhook.createdAt,
            webhook.applicantId ?? null,
            webhook.correlationId ?? null,
            webhook.eventCreatedAt ?? null,
            webhook.externalUserId ?? null,
            webhook.payloadDigest ?? null,
            webhook.reviewAnswer ?? null,
            webhook.reviewStatus ?? null,
        ]);
        return webhook;
    }
};
KycWebhooksRepository = __decorate([
    Injectable(),
    __param(0, Inject(DatabaseService)),
    __metadata("design:paramtypes", [DatabaseService])
], KycWebhooksRepository);
export { KycWebhooksRepository };
//# sourceMappingURL=kyc-webhooks.repository.js.map