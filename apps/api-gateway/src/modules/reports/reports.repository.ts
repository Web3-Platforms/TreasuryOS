import { Inject, Injectable } from '@nestjs/common';
import type { ReportRecord, ReportJobStatus } from '@treasuryos/types';

import { DatabaseService } from '../database/database.service.js';
import { toIso, asJsonRecord } from '../../common/db-utils.js';
import type { PoolClient } from 'pg';

function mapReportRow(row: Record<string, unknown>): ReportRecord {
  return {
    id: String(row.id),
    month: String(row.month),
    status: String(row.status) as ReportJobStatus,
    generatedBy: String(row.generated_by),
    createdAt: toIso(row.created_at) ?? new Date().toISOString(),
    generatedAt: toIso(row.generated_at),
    artifactPath: row.artifact_path ? String(row.artifact_path) : undefined,
    artifactMimeType: row.artifact_mime_type ? String(row.artifact_mime_type) : undefined,
    downloadName: row.download_name ? String(row.download_name) : undefined,
    rowCount: typeof row.row_count === 'number' ? row.row_count : parseInt(String(row.row_count || '0'), 10),
    metrics: asJsonRecord(row.metrics) as unknown as ReportRecord['metrics'],
  };
}

export interface ReportEntityData {
  id: string;
  legalName: string;
  jurisdiction: string;
  status: string;
  kycStatus: string;
  riskLevel: string;
  provider: string;
  externalUserId: string;
  wallets: Array<{
    id: string;
    walletAddress: string;
    chainTxSignature?: string;
    requestedBy: string;
  }>;
  cases: Array<{
    id: string;
    transactionReference: string;
    caseStatus: string;
    amount: string;
    asset: string;
    sourceWallet: string;
    destinationWallet: string;
  }>;
}

@Injectable()
export class ReportsRepository {
  constructor(@Inject(DatabaseService) private readonly database: DatabaseService) {}

  async listAll(): Promise<ReportRecord[]> {
    const result = await this.database.pool.query(
      `
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
      `,
    );

    return result.rows.map((row) => mapReportRow(row as Record<string, unknown>));
  }

  async findById(reportId: string, client?: PoolClient): Promise<ReportRecord | undefined> {
    const executor = client ?? this.database.pool;
    const result = await executor.query(
      `
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
      `,
      [reportId],
    );

    return result.rows[0] ? mapReportRow(result.rows[0] as Record<string, unknown>) : undefined;
  }

  async save(report: ReportRecord, client?: PoolClient): Promise<ReportRecord> {
    const executor = client ?? this.database.pool;
    await executor.query(
      `
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
      `,
      [
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
      ],
    );

    return report;
  }

  async fetchReportData(targetMonth: string): Promise<ReportEntityData[]> {
    const result = await this.database.pool.query(
      `
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
      `,
      [targetMonth + '%'],
    );

    return result.rows as ReportEntityData[];
  }
}
