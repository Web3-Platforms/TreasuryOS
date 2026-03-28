import { Module } from '@nestjs/common';

import { AuditModule } from '../audit/audit.module.js';
import { EntitiesModule } from '../entities/entities.module.js';
import { SumsubModule } from './sumsub.module.js';
import { KycController } from './kyc.controller.js';

@Module({
  imports: [AuditModule, EntitiesModule, SumsubModule],
  controllers: [KycController],
})
export class KycModule {}
