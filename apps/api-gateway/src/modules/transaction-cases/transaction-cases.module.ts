import { Module } from '@nestjs/common';

import { AuditModule } from '../audit/audit.module.js';
import { DatabaseModule } from '../database/database.module.js';
import { EntitiesModule } from '../entities/entities.module.js';
import { WalletsModule } from '../wallets/wallets.module.js';
import { PlatformModule } from '../platform/platform.module.js';
import { TransactionCasesRepository } from './transaction-cases.repository.js';
import { TransactionCasesController } from './transaction-cases.controller.js';
import { TransactionCasesService } from './transaction-cases.service.js';

@Module({
  imports: [DatabaseModule, AuditModule, PlatformModule, EntitiesModule, WalletsModule],
  controllers: [TransactionCasesController],
  providers: [TransactionCasesRepository, TransactionCasesService],
  exports: [TransactionCasesService, TransactionCasesRepository],
})
export class TransactionCasesModule {}
