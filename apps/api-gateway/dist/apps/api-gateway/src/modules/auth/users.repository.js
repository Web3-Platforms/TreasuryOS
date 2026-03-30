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
let UsersRepository = class UsersRepository {
    database;
    constructor(database) {
        this.database = database;
    }
    async findByEmail(email) {
        const normalized = email.trim().toLowerCase();
        const result = await this.database.pool.query(`
        select id, email, role, display_name, roles, status, password_salt, password_hash, created_at, last_login_at
        from app_users
        where lower(email) = $1
        limit 1
      `, [normalized]);
        return result.rows[0] ? mapUserRow(result.rows[0]) : undefined;
    }
    async findById(userId) {
        const result = await this.database.pool.query(`
        select id, email, role, display_name, roles, status, password_salt, password_hash, created_at, last_login_at
        from app_users
        where id = $1
        limit 1
      `, [userId]);
        return result.rows[0] ? mapUserRow(result.rows[0]) : undefined;
    }
    async updateLastLoginAt(userId, lastLoginAt) {
        await this.database.pool.query(`
        update app_users
        set last_login_at = $2
        where id = $1
      `, [userId, lastLoginAt]);
    }
};
UsersRepository = __decorate([
    Injectable(),
    __param(0, Inject(DatabaseService)),
    __metadata("design:paramtypes", [DatabaseService])
], UsersRepository);
export { UsersRepository };
//# sourceMappingURL=users.repository.js.map