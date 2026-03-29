import { Inject, Injectable } from '@nestjs/common';
import type { ReviewedTransaction } from '@treasuryos/types';

import { DatabaseService } from '../database/database.service.js';
import { toIso, asStringArray } from '../../common/db-utils.js';
import type { PoolClient } from 'pg';

function mapTransactionCaseRow(row: Record<string, unknown>): ReviewedTransaction {
  return {
    id: String(row.id),
    entityId: String(row.entity_id),
    walletId: row.wallet_id ? String(row.wallet_id) : undefined,
    transactionReference: String(row.transaction_reference),
    caseStatus: String(row.case_status) as ReviewedTransaction['caseStatus'],
    amount: String(row.amount),
    asset: String(row.asset),
    sourceWallet: String(row.source_wallet),
    destinationWallet: String(row.destination_wallet),
    jurisdiction: String(row.jurisdiction) as ReviewedTransaction['jurisdiction'],
    riskLevel: String(row.risk_level) as ReviewedTransaction['riskLevel'],
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

@Injectable()
export class TransactionCasesRepository {
  constructor(@Inject(DatabaseService) private readonly database: DatabaseService) {}

  async listCases(filters: { entityId?: string; status?: string; limit: number }): Promise<ReviewedTransaction[]> {
    let query = `
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
      where 1=1
    `;
    const params: any[] = [];

    if (filters.entityId) {
      params.push(filters.entityId);
      query += ` and entity_id = $${params.length}`;
    }

    if (filters.status) {
      params.push(filters.status);
      query += ` and case_status = $${params.length}`;
    }

    query += ` order by updated_at desc`;

    if (filters.limit) {
      params.push(filters.limit);
      query += ` limit $${params.length}`;
    }

    const result = await this.database.pool.query(query, params);
    return result.rows.map((row) => mapTransactionCaseRow(row as Record<string, unknown>));
  }

  async findById(caseId: string, client?: PoolClient): Promise<ReviewedTransaction | undefined> {
    const executor = client ?? this.database.pool;
    const result = await executor.query(
      `
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
        where id = $1
        limit 1
      `,
      [caseId],
    );

    return result.rows[0] ? mapTransactionCaseRow(result.rows[0] as Record<string, unknown>) : undefined;
  }

  async findByReferenceAndEntityId(reference: string, entityId: string, client?: PoolClient): Promise<ReviewedTransaction | undefined> {
    const executor = client ?? this.database.pool;
    const result = await executor.query(
      `
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
        where transaction_reference = $1 and entity_id = $2
        limit 1
      `,
      [reference, entityId],
    );

    return result.rows[0] ? mapTransactionCaseRow(result.rows[0] as Record<string, unknown>) : undefined;
  }

  async save(transactionCase: ReviewedTransaction, client?: PoolClient): Promise<ReviewedTransaction> {
    const executor = client ?? this.database.pool;
    await executor.query(
      `
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
        on conflict (id) do update
        set
          case_status = excluded.case_status,
          notes = excluded.notes,
          review_notes = excluded.review_notes,
          evidence_ref = excluded.evidence_ref,
          reviewed_by = excluded.reviewed_by,
          resolution_reason = excluded.resolution_reason,
          updated_at = excluded.updated_at,
          reviewed_at = excluded.reviewed_at
      `,
      [
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
      ],
    );

    return transactionCase;
  }
}
