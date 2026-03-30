var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var PilotStoreService_1;
import fs from 'node:fs';
import { Injectable, Logger } from '@nestjs/common';
import { Pool } from 'pg';
import { UserRole, UserStatus, } from '@treasuryos/types';
import { hashPassword } from '../../common/passwords.js';
import { loadApiGatewayEnv } from '../../config/env.js';
function createEmptyStore() {
    return {
        users: [],
        sessions: [],
        entities: [],
        wallets: [],
        transactionCases: [],
        auditEvents: [],
        reports: [],
        kycWebhooks: [],
    };
}
function toIso(value) {
    if (!value) {
        return undefined;
    }
    if (value instanceof Date) {
        return value.toISOString();
    }
    const parsed = new Date(String(value));
    return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString();
}
function asStringArray(value) {
    if (!Array.isArray(value)) {
        return [];
    }
    return value.map((entry) => String(entry));
}
function asJsonRecord(value) {
    if (!value) {
        return undefined;
    }
    if (typeof value === 'string') {
        try {
            return JSON.parse(value);
        }
        catch {
            return undefined;
        }
    }
    if (typeof value === 'object') {
        return value;
    }
    return undefined;
}
function mapUserRow(row) {
    const roles = asStringArray(row.roles);
    return {
        id: String(row.id),
        email: String(row.email),
        displayName: String(row.display_name),
        roles: (roles.length > 0 ? roles : [String(row.role)]),
        status: String(row.status),
        passwordSalt: String(row.password_salt ?? ''),
        passwordHash: String(row.password_hash ?? ''),
        createdAt: toIso(row.created_at) ?? new Date().toISOString(),
        lastLoginAt: toIso(row.last_login_at),
    };
}
function mapSessionRow(row) {
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
function mapWalletRow(row) {
    return {
        id: String(row.id),
        entityId: String(row.entity_id),
        walletAddress: String(row.wallet_address),
        label: row.label ? String(row.label) : undefined,
        status: String(row.status),
        chainSyncStatus: String(row.chain_sync_status),
        whitelistEntry: row.whitelist_entry ? String(row.whitelist_entry) : undefined,
        chainTxSignature: row.chain_tx_signature ? String(row.chain_tx_signature) : undefined,
        syncError: row.sync_error ? String(row.sync_error) : undefined,
        requestedBy: String(row.requested_by),
        reviewedBy: row.reviewed_by ? String(row.reviewed_by) : undefined,
        reviewedAt: toIso(row.reviewed_at),
        reviewNotes: row.review_notes ? String(row.review_notes) : undefined,
        chainSyncAttemptedAt: toIso(row.chain_sync_attempted_at),
        createdAt: toIso(row.created_at) ?? new Date().toISOString(),
        updatedAt: toIso(row.updated_at) ?? new Date().toISOString(),
    };
}
function mapTransactionCaseRow(row) {
    return {
        id: String(row.id),
        entityId: String(row.entity_id),
        walletId: row.wallet_id ? String(row.wallet_id) : undefined,
        transactionReference: String(row.transaction_reference),
        caseStatus: String(row.case_status),
        amount: String(row.amount),
        asset: String(row.asset),
        sourceWallet: String(row.source_wallet),
        destinationWallet: String(row.destination_wallet),
        jurisdiction: String(row.jurisdiction),
        riskLevel: String(row.risk_level),
        triggeredRules: asStringArray(row.triggered_rules),
        manualReviewRequested: Boolean(row.manual_review_requested),
        notes: row.notes ? String(row.notes) : undefined,
        reviewNotes: row.review_notes ? String(row.review_notes) : undefined,
        evidenceRef: row.evidence_ref ? String(row.evidence_ref) : undefined,
        createdBy: String(row.created_by),
        reviewedBy: row.reviewed_by ? String(row.reviewed_by) : undefined,
        resolutionReason: row.resolution_reason ? String(row.resolution_reason) : undefined,
        createdAt: toIso(row.created_at) ?? new Date().toISOString(),
        updatedAt: toIso(row.updated_at) ?? new Date().toISOString(),
        reviewedAt: toIso(row.reviewed_at),
    };
}
function mapAuditEventRow(row) {
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
function mapReportRow(row) {
    const metrics = asJsonRecord(row.metrics) ?? {};
    return {
        id: String(row.id),
        month: String(row.month),
        status: String(row.status),
        generatedBy: String(row.generated_by),
        createdAt: toIso(row.created_at) ?? new Date().toISOString(),
        generatedAt: toIso(row.generated_at),
        artifactPath: row.artifact_path ? String(row.artifact_path) : undefined,
        artifactMimeType: row.artifact_mime_type ? String(row.artifact_mime_type) : undefined,
        downloadName: row.download_name ? String(row.download_name) : undefined,
        rowCount: row.row_count !== null && row.row_count !== undefined ? Number(row.row_count) : undefined,
        metrics: {
            entityCount: Number(metrics.entityCount ?? 0),
            approvedWalletCount: Number(metrics.approvedWalletCount ?? 0),
            totalCaseCount: Number(metrics.totalCaseCount ?? 0),
            openCaseCount: Number(metrics.openCaseCount ?? 0),
            approvedCaseCount: Number(metrics.approvedCaseCount ?? 0),
            rejectedCaseCount: Number(metrics.rejectedCaseCount ?? 0),
            escalatedCaseCount: Number(metrics.escalatedCaseCount ?? 0),
        },
    };
}
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
let PilotStoreService = PilotStoreService_1 = class PilotStoreService {
    env = loadApiGatewayEnv();
    logger = new Logger(PilotStoreService_1.name);
    pool = new Pool({
        connectionString: this.env.DATABASE_URL,
    });
    initializationPromise;
    constructor() {
        fs.mkdirSync(this.env.PILOT_REPORTS_DIR, { recursive: true });
    }
    getReportsDirPath() {
        return this.env.PILOT_REPORTS_DIR;
    }
    async snapshot(executor) {
        await this.ensureInitialized();
        const db = executor ?? this.pool;
        const users = await db.query(`
        select id, email, role, display_name, roles, status, password_salt, password_hash, created_at, last_login_at
        from app_users
        order by created_at asc
      `);
        const sessions = await db.query(`
        select id, user_id, token_id, created_at, expires_at, last_seen_at, ip_address, user_agent, revoked_at
        from auth_sessions
        order by created_at desc
      `);
        const entities = await db.query(`
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
        const wallets = await db.query(`
        select
          id,
          entity_id,
          wallet_address,
          label,
          status,
          chain_sync_status,
          whitelist_entry,
          chain_tx_signature,
          sync_error,
          requested_by,
          reviewed_by,
          reviewed_at,
          review_notes,
          chain_sync_attempted_at,
          created_at,
          updated_at
        from wallets
        order by updated_at desc
      `);
        const transactionCases = await db.query(`
        select
          id,
          entity_id,
          wallet_id,
          transaction_reference,
          case_status,
          amount,
          asset,
          source_wallet,
          destination_wallet,
          jurisdiction,
          risk_level,
          triggered_rules,
          manual_review_requested,
          notes,
          review_notes,
          evidence_ref,
          created_by,
          reviewed_by,
          resolution_reason,
          created_at,
          updated_at,
          reviewed_at
        from transaction_cases
        order by updated_at desc
      `);
        const auditEvents = await db.query(`
        select id, actor_id, actor_email, action, resource_type, resource_id, summary, metadata, created_at
        from audit_events
        order by created_at desc
      `);
        const reports = await db.query(`
        select
          id,
          month,
          status,
          generated_by,
          created_at,
          generated_at,
          artifact_path,
          artifact_mime_type,
          download_name,
          row_count,
          metrics
        from report_jobs
        order by coalesce(generated_at, created_at) desc
      `);
        const kycWebhooks = await db.query(`
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
        order by created_at desc
      `);
        return {
            users: users.rows.map((row) => mapUserRow(row)),
            sessions: sessions.rows.map((row) => mapSessionRow(row)),
            entities: entities.rows.map((row) => mapEntityRow(row)),
            wallets: wallets.rows.map((row) => mapWalletRow(row)),
            transactionCases: transactionCases.rows.map((row) => mapTransactionCaseRow(row)),
            auditEvents: auditEvents.rows.map((row) => mapAuditEventRow(row)),
            reports: reports.rows.map((row) => mapReportRow(row)),
            kycWebhooks: kycWebhooks.rows.map((row) => mapKycWebhookRow(row)),
        };
    }
    async mutate(mutator) {
        await this.ensureInitialized();
        const client = await this.pool.connect();
        try {
            await client.query('begin');
            await client.query(`
          lock table
            app_users,
            auth_sessions,
            entities,
            wallets,
            transaction_cases,
            report_jobs,
            provider_webhooks,
            audit_events
          in exclusive mode
        `);
            const store = await this.snapshot(client);
            const result = await mutator(store);
            await this.writeStore(client, store);
            await client.query('commit');
            return result;
        }
        catch (error) {
            await client.query('rollback');
            throw error;
        }
        finally {
            client.release();
        }
    }
    async findUserByEmail(email) {
        await this.ensureInitialized();
        const normalized = email.trim().toLowerCase();
        const result = await this.pool.query(`
        select id, email, role, display_name, roles, status, password_salt, password_hash, created_at, last_login_at
        from app_users
        where lower(email) = $1
        limit 1
      `, [normalized]);
        return result.rows[0] ? mapUserRow(result.rows[0]) : undefined;
    }
    async findUserById(userId) {
        await this.ensureInitialized();
        const result = await this.pool.query(`
        select id, email, role, display_name, roles, status, password_salt, password_hash, created_at, last_login_at
        from app_users
        where id = $1
        limit 1
      `, [userId]);
        return result.rows[0] ? mapUserRow(result.rows[0]) : undefined;
    }
    async findSessionById(sessionId) {
        await this.ensureInitialized();
        const result = await this.pool.query(`
        select id, user_id, token_id, created_at, expires_at, last_seen_at, ip_address, user_agent, revoked_at
        from auth_sessions
        where id = $1
        limit 1
      `, [sessionId]);
        return result.rows[0] ? mapSessionRow(result.rows[0]) : undefined;
    }
    async saveSession(session) {
        return this.mutate((store) => {
            const index = store.sessions.findIndex((record) => record.id === session.id);
            if (index >= 0) {
                store.sessions[index] = session;
            }
            else {
                store.sessions.unshift(session);
            }
            store.sessions = store.sessions.slice(0, 250);
            return session;
        });
    }
    async appendAuditEvent(event) {
        return this.mutate((store) => {
            store.auditEvents.unshift(event);
            store.auditEvents = store.auditEvents.slice(0, 1000);
            return event;
        });
    }
    async onModuleDestroy() {
        await this.pool.end();
    }
    async ensureInitialized() {
        if (!this.initializationPromise) {
            this.initializationPromise = this.initialize();
        }
        return this.initializationPromise;
    }
    async initialize() {
        try {
            await this.upsertSeedUsers(this.pool);
        }
        catch (error) {
            this.logger.error(`Postgres initialization failed: ${error instanceof Error ? error.message : String(error)}`);
            throw error;
        }
    }
    async upsertSeedUsers(executor) {
        const now = new Date().toISOString();
        for (const seed of this.defaultUsers()) {
            const credentials = hashPassword(seed.password);
            await executor.query(`
          insert into app_users (
            id,
            email,
            role,
            display_name,
            roles,
            status,
            password_salt,
            password_hash,
            created_at
          )
          values ($1, $2, $3, $4, $5::text[], $6, $7, $8, $9)
          on conflict (id) do update
          set
            email = excluded.email,
            role = excluded.role,
            display_name = excluded.display_name,
            roles = excluded.roles,
            status = excluded.status,
            password_salt = excluded.password_salt,
            password_hash = excluded.password_hash
        `, [
                seed.id,
                seed.email.toLowerCase(),
                seed.roles[0],
                seed.displayName,
                seed.roles,
                UserStatus.Active,
                credentials.salt,
                credentials.hash,
                now,
            ]);
        }
    }
    async writeStore(client, store) {
        await this.upsertSeedUsers(client);
        for (const user of store.users) {
            await client.query(`
          insert into app_users (
            id,
            email,
            role,
            display_name,
            roles,
            status,
            password_salt,
            password_hash,
            created_at,
            last_login_at
          )
          values ($1, $2, $3, $4, $5::text[], $6, $7, $8, $9, $10)
          on conflict (id) do update
          set
            email = excluded.email,
            role = excluded.role,
            display_name = excluded.display_name,
            roles = excluded.roles,
            status = excluded.status,
            password_salt = excluded.password_salt,
            password_hash = excluded.password_hash,
            last_login_at = excluded.last_login_at
        `, [
                user.id,
                user.email.toLowerCase(),
                user.roles[0],
                user.displayName,
                user.roles,
                user.status,
                user.passwordSalt,
                user.passwordHash,
                user.createdAt,
                user.lastLoginAt ?? null,
            ]);
        }
        await client.query('delete from auth_sessions');
        await client.query('delete from transaction_cases');
        await client.query('delete from wallets');
        await client.query('delete from provider_webhooks');
        await client.query('delete from report_jobs');
        await client.query('delete from audit_events');
        await client.query('delete from entities');
        for (const entity of store.entities) {
            await client.query(`
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
        }
        for (const wallet of store.wallets) {
            await client.query(`
          insert into wallets (
            id,
            entity_id,
            wallet_address,
            label,
            status,
            chain_sync_status,
            whitelist_entry,
            chain_tx_signature,
            sync_error,
            requested_by,
            reviewed_by,
            reviewed_at,
            review_notes,
            chain_sync_attempted_at,
            created_at,
            updated_at
          )
          values (
            $1, $2, $3, $4, $5, $6, $7, $8,
            $9, $10, $11, $12, $13, $14, $15, $16
          )
        `, [
                wallet.id,
                wallet.entityId,
                wallet.walletAddress,
                wallet.label ?? null,
                wallet.status,
                wallet.chainSyncStatus,
                wallet.whitelistEntry ?? null,
                wallet.chainTxSignature ?? null,
                wallet.syncError ?? null,
                wallet.requestedBy,
                wallet.reviewedBy ?? null,
                wallet.reviewedAt ?? null,
                wallet.reviewNotes ?? null,
                wallet.chainSyncAttemptedAt ?? null,
                wallet.createdAt,
                wallet.updatedAt,
            ]);
        }
        for (const transactionCase of store.transactionCases) {
            await client.query(`
          insert into transaction_cases (
            id,
            entity_id,
            wallet_id,
            transaction_reference,
            case_status,
            amount,
            asset,
            source_wallet,
            destination_wallet,
            jurisdiction,
            risk_level,
            triggered_rules,
            manual_review_requested,
            notes,
            review_notes,
            evidence_ref,
            created_by,
            reviewed_by,
            resolution_reason,
            created_at,
            updated_at,
            reviewed_at
          )
          values (
            $1, $2, $3, $4, $5, $6, $7, $8, $9,
            $10, $11, $12::text[], $13, $14, $15, $16,
            $17, $18, $19, $20, $21, $22
          )
        `, [
                transactionCase.id,
                transactionCase.entityId,
                transactionCase.walletId ?? null,
                transactionCase.transactionReference,
                transactionCase.caseStatus,
                transactionCase.amount,
                transactionCase.asset,
                transactionCase.sourceWallet,
                transactionCase.destinationWallet,
                transactionCase.jurisdiction,
                transactionCase.riskLevel,
                transactionCase.triggeredRules,
                transactionCase.manualReviewRequested,
                transactionCase.notes ?? null,
                transactionCase.reviewNotes ?? null,
                transactionCase.evidenceRef ?? null,
                transactionCase.createdBy,
                transactionCase.reviewedBy ?? null,
                transactionCase.resolutionReason ?? null,
                transactionCase.createdAt,
                transactionCase.updatedAt,
                transactionCase.reviewedAt ?? null,
            ]);
        }
        for (const report of store.reports) {
            await client.query(`
          insert into report_jobs (
            id,
            month,
            status,
            generated_by,
            created_at,
            generated_at,
            artifact_path,
            artifact_mime_type,
            download_name,
            row_count,
            metrics
          )
          values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11::jsonb)
        `, [
                report.id,
                report.month,
                report.status,
                report.generatedBy,
                report.createdAt,
                report.generatedAt ?? null,
                report.artifactPath ?? null,
                report.artifactMimeType ?? null,
                report.downloadName ?? null,
                report.rowCount ?? null,
                JSON.stringify(report.metrics),
            ]);
        }
        for (const webhook of store.kycWebhooks) {
            await client.query(`
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
        }
        for (const event of store.auditEvents) {
            await client.query(`
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
        `, [
                event.id,
                event.actorId,
                event.actorEmail,
                event.action,
                event.resourceType,
                event.resourceId,
                event.summary,
                JSON.stringify(event.metadata ?? {}),
                event.createdAt,
            ]);
        }
        for (const session of store.sessions) {
            await client.query(`
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
        `, [
                session.id,
                session.userId,
                session.tokenId,
                session.createdAt,
                session.expiresAt,
                session.lastSeenAt,
                session.ipAddress ?? null,
                session.userAgent ?? null,
                session.revokedAt ?? null,
            ]);
        }
    }
    defaultUsers() {
        return [
            {
                id: 'user_admin',
                displayName: 'Pilot Admin',
                email: this.env.DEFAULT_ADMIN_EMAIL,
                password: this.env.DEFAULT_ADMIN_PASSWORD,
                roles: [UserRole.Admin],
            },
            {
                id: 'user_compliance',
                displayName: 'Pilot Compliance Officer',
                email: this.env.DEFAULT_COMPLIANCE_EMAIL,
                password: this.env.DEFAULT_COMPLIANCE_PASSWORD,
                roles: [UserRole.ComplianceOfficer],
            },
            {
                id: 'user_auditor',
                displayName: 'Pilot Auditor',
                email: this.env.DEFAULT_AUDITOR_EMAIL,
                password: this.env.DEFAULT_AUDITOR_PASSWORD,
                roles: [UserRole.Auditor],
            },
        ];
    }
};
PilotStoreService = PilotStoreService_1 = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [])
], PilotStoreService);
export { PilotStoreService };
//# sourceMappingURL=pilot-store.service.js.map