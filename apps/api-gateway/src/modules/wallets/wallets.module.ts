import { Module } from '@nestjs/common';

import { AuditModule } from '../audit/audit.module.js';
import { DatabaseModule } from '../database/database.module.js';
import { EntitiesModule } from '../entities/entities.module.js';
import { PlatformModule } from '../platform/platform.module.js';
import { WalletsRepository } from './wallets.repository.js';
import { WalletsController } from './wallets.controller.js';
import { WalletSyncReadinessService } from './wallet-sync-readiness.service.js';
import { WalletSyncService } from './wallet-sync.service.js';
import { WalletsService } from './wallets.service.js';

@Module({
  imports: [DatabaseModule, AuditModule, PlatformModule, EntitiesModule],
  controllers: [WalletsController],
  providers: [WalletSyncReadinessService, WalletSyncService, WalletsRepository, WalletsService],
  exports: [WalletSyncReadinessService, WalletSyncService, WalletsService, WalletsRepository],
})
export class WalletsModule {}
