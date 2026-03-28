import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { UserRole, UserStatus } from '@treasuryos/types';
import { Pool, type PoolClient } from 'pg';

import { hashPassword } from '../../common/passwords.js';
import { loadApiGatewayEnv } from '../../config/env.js';

type DatabaseExecutor = Pick<Pool, 'query'> | Pick<PoolClient, 'query'>;

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private readonly env = loadApiGatewayEnv();
  private readonly logger = new Logger(DatabaseService.name);
  public readonly pool = new Pool({
    connectionString: this.env.DATABASE_URL,
    ssl: this.shouldUseSsl()
      ? { rejectUnauthorized: false }
      : false,
  });

  private shouldUseSsl(): boolean {
    if (this.env.DATABASE_SSL) {
      return true;
    }
    return this.env.DATABASE_URL.includes('sslmode=require');
  }

  async onModuleInit() {
    try {
      await this.upsertSeedUsers();
    } catch (error) {
      this.logger.error(
        `Postgres initialization failed: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.pool.end();
  }

  getPool(): Pool {
    return this.pool;
  }

  async withTransaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query('begin');
      const result = await callback(client);
      await client.query('commit');
      return result;
    } catch (error) {
      await client.query('rollback');
      throw error;
    } finally {
      client.release();
    }
  }

  private async upsertSeedUsers() {
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
      await this.pool.query(
        `
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
        `,
        [
          seed.id,
          seed.email.toLowerCase(),
          seed.roles[0],
          seed.displayName,
          seed.roles,
          UserStatus.Active,
          credentials.salt,
          credentials.hash,
          now,
        ],
      );
    }
  }
}
