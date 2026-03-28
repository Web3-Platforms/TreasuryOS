import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

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
import { StructuredLoggingMiddleware } from './modules/platform/structured-logging.middleware.js';

@Module({
  imports: [
    PlatformModule,
    DatabaseModule,
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
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100,
    }]),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(StructuredLoggingMiddleware).forRoutes({
      path: '*path',
      method: RequestMethod.ALL,
    });
  }
}
