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
import { toIso, asJsonRecord } from '../../common/db-utils.js';
function mapReportRow(row) {
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
        rowCount: typeof row.row_count === 'number' ? row.row_count : parseInt(String(row.row_count || '0'), 10),
        metrics: asJsonRecord(row.metrics),
    };
}
let ReportsRepository = class ReportsRepository {
    database;
    constructor(database) {
        this.database = database;
    }
    async listAll() {
        const result = await this.database.pool.query(`
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
        order by created_at desc
      `);
        return result.rows.map((row) => mapReportRow(row));
    }
    async findById(reportId, client) {
        const executor = client ?? this.database.pool;
        const result = await executor.query(`
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
        where id = $1
        limit 1
      `, [reportId]);
        return result.rows[0] ? mapReportRow(result.rows[0]) : undefined;
    }
    async save(report, client) {
        const executor = client ?? this.database.pool;
        await executor.query(`
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
        on conflict (id) do update
        set
          status = excluded.status,
          generated_at = excluded.generated_at,
          artifact_path = excluded.artifact_path,
          artifact_mime_type = excluded.artifact_mime_type,
          download_name = excluded.download_name,
          row_count = excluded.row_count,
          metrics = excluded.metrics
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
            report.rowCount ?? 0,
            JSON.stringify(report.metrics ?? {}),
        ]);
        return report;
    }
    async fetchReportData(targetMonth) {
        const result = await this.database.pool.query(`
        select
          e.id,
          e.legal_name as "legalName",
          e.jurisdiction,
          e.status,
          e.kyc_status as "kycStatus",
          e.risk_level as "riskLevel",
          e.provider,
          e.external_user_id as "externalUserId",
          (
            select coalesce(json_agg(json_build_object(
              'id', w.id,
              'walletAddress', w.wallet_address,
              'chainTxSignature', w.chain_tx_signature,
              'requestedBy', w.requested_by
            )), '[]'::json)
            from wallets w
            where w.entity_id = e.id
          ) as "wallets",
          (
            select coalesce(json_agg(json_build_object(
              'id', tc.id,
              'transactionReference', tc.transaction_reference,
              'caseStatus', tc.case_status,
              'amount', tc.amount,
              'asset', tc.asset,
              'sourceWallet', tc.source_wallet,
              'destinationWallet', tc.destination_wallet
            )), '[]'::json)
            from transaction_cases tc
            where tc.entity_id = e.id
              and tc.created_at like $1
          ) as "cases"
        from entities e
      `, [targetMonth + '%']);
        return result.rows;
    }
};
ReportsRepository = __decorate([
    Injectable(),
    __param(0, Inject(DatabaseService)),
    __metadata("design:paramtypes", [DatabaseService])
], ReportsRepository);
export { ReportsRepository };
//# sourceMappingURL=reports.repository.js.map