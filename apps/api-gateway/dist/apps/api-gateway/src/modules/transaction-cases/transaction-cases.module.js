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
import { WalletsModule } from '../wallets/wallets.module.js';
import { PlatformModule } from '../platform/platform.module.js';
import { TransactionCasesRepository } from './transaction-cases.repository.js';
import { TransactionCasesController } from './transaction-cases.controller.js';
import { TransactionCasesService } from './transaction-cases.service.js';
let TransactionCasesModule = class TransactionCasesModule {
};
TransactionCasesModule = __decorate([
    Module({
        imports: [DatabaseModule, AuditModule, PlatformModule, EntitiesModule, WalletsModule],
        controllers: [TransactionCasesController],
        providers: [TransactionCasesRepository, TransactionCasesService],
        exports: [TransactionCasesService, TransactionCasesRepository],
    })
], TransactionCasesModule);
export { TransactionCasesModule };
//# sourceMappingURL=transaction-cases.module.js.map