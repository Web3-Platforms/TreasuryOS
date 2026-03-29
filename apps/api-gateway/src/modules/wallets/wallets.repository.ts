import { Inject, Injectable } from '@nestjs/common';
import type { WalletRecord } from '@treasuryos/types';

import { DatabaseService } from '../database/database.service.js';
import { toIso } from '../../common/db-utils.js';
import type { PoolClient } from 'pg';

function mapWalletRow(row: Record<string, unknown>): WalletRecord {
  return {
    id: String(row.id),
    entityId: String(row.entity_id),
    walletAddress: String(row.wallet_address),
    label: row.label ? String(row.label) : undefined,
    status: String(row.status) as WalletRecord['status'],
    chainSyncStatus: String(row.chain_sync_status) as WalletRecord['chainSyncStatus'],
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

@Injectable()
export class WalletsRepository {
  constructor(@Inject(DatabaseService) private readonly database: DatabaseService) {}

  async listAll(entityId?: string): Promise<WalletRecord[]> {
    let query = `
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
    `;
    const params: any[] = [];

    if (entityId) {
      query += ` where entity_id = $1`;
      params.push(entityId);
    }

    query += ` order by updated_at desc`;

    const result = await this.database.pool.query(query, params);
    return result.rows.map((row) => mapWalletRow(row as Record<string, unknown>));
  }

  async findById(walletId: string, client?: PoolClient): Promise<WalletRecord | undefined> {
    const executor = client ?? this.database.pool;
    const result = await executor.query(
      `
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
        where id = $1
        limit 1
      `,
      [walletId],
    );

    return result.rows[0] ? mapWalletRow(result.rows[0] as Record<string, unknown>) : undefined;
  }

  async existsForEntity(entityId: string, walletAddress: string, excludeStatuses: string[] = []): Promise<boolean> {
    let query = `select 1 from wallets where entity_id = $1 and wallet_address = $2`;
    let params: any[] = [entityId, walletAddress];

    if (excludeStatuses.length > 0) {
      query += ` and status != ALL($3::text[])`;
      params.push(excludeStatuses);
    }

    query += ` limit 1`;

    const result = await this.database.pool.query(query, params);
    return result.rowCount !== null && result.rowCount > 0;
  }

  async findByEntityId(entityId: string): Promise<WalletRecord[]> {
    const result = await this.database.pool.query(
      `
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
        where entity_id = $1
      `,
      [entityId],
    );

    return result.rows.map((row) => mapWalletRow(row as Record<string, unknown>));
  }

  async save(wallet: WalletRecord, client?: PoolClient): Promise<WalletRecord> {
    const executor = client ?? this.database.pool;
    await executor.query(
      `
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
        on conflict (id) do update
        set
          label = excluded.label,
          status = excluded.status,
          chain_sync_status = excluded.chain_sync_status,
          whitelist_entry = excluded.whitelist_entry,
          chain_tx_signature = excluded.chain_tx_signature,
          sync_error = excluded.sync_error,
          reviewed_by = excluded.reviewed_by,
          reviewed_at = excluded.reviewed_at,
          review_notes = excluded.review_notes,
          chain_sync_attempted_at = excluded.chain_sync_attempted_at,
          updated_at = excluded.updated_at
      `,
      [
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
      ],
    );

    return wallet;
  }
}
