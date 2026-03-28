import { Module } from '@nestjs/common';

import { AuditModule } from '../audit/audit.module.js';
import { DatabaseModule } from '../database/database.module.js';
import { PlatformModule } from '../platform/platform.module.js';
import { SumsubModule } from '../kyc/sumsub.module.js';
import { KycWebhooksRepository } from '../kyc/kyc-webhooks.repository.js';
import { EntitiesRepository } from './entities.repository.js';
import { EntitiesController } from './entities.controller.js';
import { EntitiesService } from './entities.service.js';

@Module({
  imports: [DatabaseModule, AuditModule, PlatformModule, SumsubModule],
  controllers: [EntitiesController],
  providers: [EntitiesService, EntitiesRepository, KycWebhooksRepository],
  exports: [EntitiesService, EntitiesRepository],
})
export class EntitiesModule {}
