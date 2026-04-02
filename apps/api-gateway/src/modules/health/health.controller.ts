import { Controller, Get, Inject, ServiceUnavailableException } from '@nestjs/common';

import { buildInfo } from '../../common/build-info.js';
import { loadApiGatewayEnv } from '../../config/env.js';
import { Public } from '../auth/public.decorator.js';
import { DatabaseService } from '../database/database.service.js';
import { WalletSyncReadinessService } from '../wallets/wallet-sync-readiness.service.js';

@Controller('health')
export class HealthController {
  constructor(
    @Inject(DatabaseService)
    private readonly databaseService: Pick<DatabaseService, 'getPool'>,
    @Inject(WalletSyncReadinessService)
    private readonly walletSyncReadinessService: Pick<
      WalletSyncReadinessService,
      'getReadiness' | 'getStartupReadiness'
    >,
  ) {}

  @Public()
  @Get()
  async getHealth() {
    const env = loadApiGatewayEnv();
    await this.assertDatabaseReady();
    return {
      ...this.buildBasePayload(),
      scope: {
        customerProfile: env.PILOT_CUSTOMER_PROFILE,
        institutionId: env.PILOT_INSTITUTION_ID,
        queueName: env.REDIS_QUEUE_NAME,
      },
      walletSync: this.walletSyncReadinessService.getStartupReadiness(),
    };
  }

  @Public()
  @Get('live')
  getLive() {
    return this.buildBasePayload();
  }

  @Public()
  @Get('ready')
  async getReady() {
    await this.assertDatabaseReady();

    const walletSync = await this.walletSyncReadinessService.getReadiness();

    if (!walletSync.ready) {
      throw new ServiceUnavailableException({
        status: 'error',
        message: 'Wallet sync readiness failed',
        checks: {
          database: 'ok',
          walletSync,
        },
      });
    }

    return {
      ...this.buildBasePayload(),
      checks: {
        database: 'ok',
        walletSync,
      },
    };
  }

  private buildBasePayload() {
    return {
      status: 'ok',
      service: buildInfo.service,
      version: buildInfo.version,
      timestamp: new Date().toISOString(),
    };
  }

  private async assertDatabaseReady() {
    try {
      await this.databaseService.getPool().query('SELECT 1');
    } catch (error) {
      throw new ServiceUnavailableException({
        status: 'error',
        message: 'Database connection failed',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
}
