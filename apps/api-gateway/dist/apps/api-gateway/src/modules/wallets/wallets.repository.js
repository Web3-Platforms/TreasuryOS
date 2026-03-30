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
let WalletsRepository = class WalletsRepository {
    database;
    constructor(database) {
        this.database = database;
    }
    async listAll(entityId) {
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
        const params = [];
        if (entityId) {
            query += ` where entity_id = $1`;
            params.push(entityId);
        }
        query += ` order by updated_at desc`;
        const result = await this.database.pool.query(query, params);
        return result.rows.map((row) => mapWalletRow(row));
    }
    async findById(walletId, client) {
        const executor = client ?? this.database.pool;
        const result = await executor.query(`
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
      `, [walletId]);
        return result.rows[0] ? mapWalletRow(result.rows[0]) : undefined;
    }
    async existsForEntity(entityId, walletAddress, excludeStatuses = []) {
        let query = `select 1 from wallets where entity_id = $1 and wallet_address = $2`;
        let params = [entityId, walletAddress];
        if (excludeStatuses.length > 0) {
            query += ` and status != ALL($3::text[])`;
            params.push(excludeStatuses);
        }
        query += ` limit 1`;
        const result = await this.database.pool.query(query, params);
        return result.rowCount !== null && result.rowCount > 0;
    }
    async findByEntityId(entityId) {
        const result = await this.database.pool.query(`
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
      `, [entityId]);
        return result.rows.map((row) => mapWalletRow(row));
    }
    async save(wallet, client) {
        const executor = client ?? this.database.pool;
        await executor.query(`
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
        return wallet;
    }
};
WalletsRepository = __decorate([
    Injectable(),
    __param(0, Inject(DatabaseService)),
    __metadata("design:paramtypes", [DatabaseService])
], WalletsRepository);
export { WalletsRepository };
//# sourceMappingURL=wallets.repository.js.map