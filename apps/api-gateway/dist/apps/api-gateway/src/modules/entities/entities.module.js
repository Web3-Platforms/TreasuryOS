var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module.js';
import { DatabaseModule } from '../database/database.module.js';
import { PlatformModule } from '../platform/platform.module.js';
import { SumsubModule } from '../kyc/sumsub.module.js';
import { KycWebhooksRepository } from '../kyc/kyc-webhooks.repository.js';
import { EntitiesRepository } from './entities.repository.js';
import { EntitiesController } from './entities.controller.js';
import { EntitiesService } from './entities.service.js';
let EntitiesModule = class EntitiesModule {
};
EntitiesModule = __decorate([
    Module({
        imports: [DatabaseModule, AuditModule, PlatformModule, SumsubModule],
        controllers: [EntitiesController],
        providers: [EntitiesService, EntitiesRepository, KycWebhooksRepository],
        exports: [EntitiesService, EntitiesRepository],
    })
], EntitiesModule);
export { EntitiesModule };
//# sourceMappingURL=entities.module.js.map