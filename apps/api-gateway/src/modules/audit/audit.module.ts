import { Module } from '@nestjs/common';

import { DatabaseModule } from '../database/database.module.js';
import { AuditController } from './audit.controller.js';
import { AuditService } from './audit.service.js';
import { AuditRepository } from './audit.repository.js';

@Module({
  imports: [DatabaseModule],
  controllers: [AuditController],
  providers: [AuditService, AuditRepository],
  exports: [AuditService],
})
export class AuditModule {}
