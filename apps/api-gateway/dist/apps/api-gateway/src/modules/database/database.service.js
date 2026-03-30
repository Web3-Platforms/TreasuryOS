var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var DatabaseService_1;
import { Injectable, Logger } from '@nestjs/common';
import { UserRole, UserStatus } from '@treasuryos/types';
import { Pool } from 'pg';
import { hashPassword } from '../../common/passwords.js';
import { loadApiGatewayEnv } from '../../config/env.js';
let DatabaseService = DatabaseService_1 = class DatabaseService {
    env = loadApiGatewayEnv();
    logger = new Logger(DatabaseService_1.name);
    pool = new Pool({
        connectionString: this.env.DATABASE_URL,
        ssl: this.shouldUseSsl()
            ? { rejectUnauthorized: false }
            : false,
        // ── Neon / PgBouncer-safe pool settings ──────────────────
        // Neon free tier: 5 concurrent connections through the pooler.
        // Keep this low so serverless instances don't exhaust the limit.
        max: this.env.NODE_ENV === 'production' ? 5 : 10,
        idleTimeoutMillis: 20_000,
        connectionTimeoutMillis: 10_000,
        // Prevent runaway queries from holding connections indefinitely.
        statement_timeout: 30_000,
    });
    seedUsersInitialized = false;
    shouldUseSsl() {
        if (this.env.DATABASE_SSL) {
            return true;
        }
        // Auto-detect: Neon URLs typically include sslmode=require
        return this.env.DATABASE_URL.includes('sslmode=require');
    }
    async onModuleInit() {
        // DON'T initialize seed users on startup - this causes boot failures
        // if the database is unavailable. Instead, initialize on first request.
        // This is 12-factor app best practice and required for serverless.
        this.logger.log('Database module initialized (seed users deferred to first request)');
    }
    async onModuleDestroy() {
        await this.pool.end();
    }
    getPool() {
        return this.pool;
    }
    async withTransaction(callback) {
        const client = await this.pool.connect();
        try {
            await client.query('begin');
            const result = await callback(client);
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
    async ensureSeedUsers() {
        if (this.seedUsersInitialized) {
            return;
        }
        try {
            await this.upsertSeedUsers();
            this.seedUsersInitialized = true;
            this.logger.log('Seed users initialized successfully');
        }
        catch (error) {
            this.logger.error(`Failed to initialize seed users: ${error instanceof Error ? error.message : String(error)}`, error instanceof Error ? error.stack : '');
            throw error;
        }
    }
    async upsertSeedUsers() {
        const now = new Date().toISOString();
        const seeds = [
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
        for (const seed of seeds) {
            const credentials = hashPassword(seed.password);
            await this.pool.query(`
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
};
DatabaseService = DatabaseService_1 = __decorate([
    Injectable()
], DatabaseService);
export { DatabaseService };
//# sourceMappingURL=database.service.js.map