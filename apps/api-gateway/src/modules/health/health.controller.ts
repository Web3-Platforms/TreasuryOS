import { Controller, Get, Inject, ServiceUnavailableException } from '@nestjs/common';

import { buildInfo } from '../../common/build-info.js';
import { loadApiGatewayEnv } from '../../config/env.js';
import { Public } from '../auth/public.decorator.js';
import { DatabaseService } from '../database/database.service.js';

@Controller('health')
export class HealthController {
  constructor(@Inject(DatabaseService) private readonly databaseService: DatabaseService) {}

  @Public()
  @Get()
  async getHealth() {
    const env = loadApiGatewayEnv();

    try {
      // Test database connectivity
      await this.databaseService.getPool().query('SELECT 1');
    } catch (error) {
      throw new ServiceUnavailableException({
        status: 'error',
        message: 'Database connection failed',
        error: error instanceof Error ? error.message : String(error),
      });
    }

    return {
      status: 'ok',
      service: buildInfo.service,
      version: buildInfo.version,
      timestamp: new Date().toISOString(),
      scope: {
        customerProfile: env.PILOT_CUSTOMER_PROFILE,
        institutionId: env.PILOT_INSTITUTION_ID,
        queueName: env.REDIS_QUEUE_NAME,
      },
    };
  }
}
