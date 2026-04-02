var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
let WalletsModule = class WalletsModule {
};
WalletsModule = __decorate([
    Module({
        imports: [DatabaseModule, AuditModule, PlatformModule, EntitiesModule],
        controllers: [WalletsController],
        providers: [WalletSyncReadinessService, WalletSyncService, WalletsRepository, WalletsService],
        exports: [WalletSyncReadinessService, WalletSyncService, WalletsService, WalletsRepository],
    })
], WalletsModule);
export { WalletsModule };
//# sourceMappingURL=wallets.module.js.map