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
let SessionsRepository = class SessionsRepository {
    database;
    constructor(database) {
        this.database = database;
    }
    async findById(sessionId) {
        const result = await this.database.pool.query(`
        select id, user_id, token_id, created_at, expires_at, last_seen_at, ip_address, user_agent, revoked_at
        from auth_sessions
        where id = $1
        limit 1
      `, [sessionId]);
        return result.rows[0] ? mapSessionRow(result.rows[0]) : undefined;
    }
    async findActiveByUserId(userId) {
        const result = await this.database.pool.query(`
        select id, user_id, token_id, created_at, expires_at, last_seen_at, ip_address, user_agent, revoked_at
        from auth_sessions
        where user_id = $1 and revoked_at is null and expires_at > now()
        order by created_at desc
      `, [userId]);
        return result.rows.map((row) => mapSessionRow(row));
    }
    async save(session) {
        await this.database.pool.query(`
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
        on conflict (id) do update
        set
          user_id = excluded.user_id,
          token_id = excluded.token_id,
          created_at = excluded.created_at,
          expires_at = excluded.expires_at,
          last_seen_at = excluded.last_seen_at,
          ip_address = excluded.ip_address,
          user_agent = excluded.user_agent,
          revoked_at = excluded.revoked_at
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
        return session;
    }
};
SessionsRepository = __decorate([
    Injectable(),
    __param(0, Inject(DatabaseService)),
    __metadata("design:paramtypes", [DatabaseService])
], SessionsRepository);
export { SessionsRepository };
//# sourceMappingURL=sessions.repository.js.map