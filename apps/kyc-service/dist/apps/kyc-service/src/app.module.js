var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Module } from '@nestjs/common';
import { HealthController } from './health.controller.js';
import { JumioProvider } from './providers/jumio.provider.js';
import { SumsubProvider } from './providers/sumsub.provider.js';
import { OnchainSyncService } from './sync/onchain-sync.service.js';
let AppModule = class AppModule {
};
AppModule = __decorate([
    Module({
        controllers: [HealthController],
        providers: [SumsubProvider, JumioProvider, OnchainSyncService],
    })
], AppModule);
export { AppModule };
//# sourceMappingURL=app.module.js.map