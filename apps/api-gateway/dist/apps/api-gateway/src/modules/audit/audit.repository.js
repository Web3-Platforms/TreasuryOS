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
let AuditRepository = class AuditRepository {
    database;
    constructor(database) {
        this.database = database;
    }
    async insert(event) {
        await this.database.pool.query(`
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
        return event;
    }
    async listRecent(limit) {
        const result = await this.database.pool.query(`
        select id, actor_id, actor_email, action, resource_type, resource_id, summary, metadata, created_at
        from audit_events
        order by created_at desc
        limit $1
      `, [limit]);
        return result.rows.map((row) => mapAuditEventRow(row));
    }
};
AuditRepository = __decorate([
    Injectable(),
    __param(0, Inject(DatabaseService)),
    __metadata("design:paramtypes", [DatabaseService])
], AuditRepository);
export { AuditRepository };
//# sourceMappingURL=audit.repository.js.map