var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Module, RequestMethod } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AiModule } from './modules/ai/ai.module.js';
import { AuditModule } from './modules/audit/audit.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { EntitiesModule } from './modules/entities/entities.module.js';
import { HealthModule } from './modules/health/health.module.js';
import { KycModule } from './modules/kyc/kyc.module.js';
import { DatabaseModule } from './modules/database/database.module.js';
import { PlatformModule } from './modules/platform/platform.module.js';
import { ReportsModule } from './modules/reports/reports.module.js';
import { TransactionCasesModule } from './modules/transaction-cases/transaction-cases.module.js';
import { WalletsModule } from './modules/wallets/wallets.module.js';
import { SecurityModule } from './modules/security/security.module.js';
import { GovernanceModule } from './modules/governance/governance.module.js';
import { LeadsModule } from './modules/leads/leads.module.js';
import { StorageModule } from './modules/storage/storage.module.js';
import { StructuredLoggingMiddleware } from './modules/platform/structured-logging.middleware.js';
let AppModule = class AppModule {
    configure(consumer) {
        consumer.apply(StructuredLoggingMiddleware).forRoutes({
            path: '*path',
            method: RequestMethod.ALL,
        });
    }
};
AppModule = __decorate([
    Module({
        imports: [
            PlatformModule,
            DatabaseModule,
            AiModule,
            AuditModule,
            AuthModule,
            EntitiesModule,
            KycModule,
            WalletsModule,
            TransactionCasesModule,
            ReportsModule,
            HealthModule,
            SecurityModule,
            GovernanceModule,
            LeadsModule,
            StorageModule,
            // Named throttlers allow per-endpoint overrides via @Throttle({ <name>: {...} })
            ThrottlerModule.forRoot([
                {
                    // Default for authenticated API routes
                    name: 'default',
                    ttl: 60000,
                    limit: 200,
                },
                {
                    // Tight limit for the login endpoint (brute-force protection)
                    name: 'login',
                    ttl: 60000,
                    limit: 5,
                },
                {
                    // Moderate limit for large CSV report downloads
                    name: 'reports',
                    ttl: 60000,
                    limit: 20,
                },
            ]),
        ],
        providers: [
            {
                provide: APP_GUARD,
                useClass: ThrottlerGuard,
            },
        ],
    })
], AppModule);
export { AppModule };
//# sourceMappingURL=app.module.js.map