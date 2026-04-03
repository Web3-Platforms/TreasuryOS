import { Module } from '@nestjs/common';

import { AuditModule } from '../audit/audit.module.js';
import { DatabaseModule } from '../database/database.module.js';
import { EntitiesModule } from '../entities/entities.module.js';
import { TransactionCasesModule } from '../transaction-cases/transaction-cases.module.js';
import { WalletsModule } from '../wallets/wallets.module.js';
import { AI_PROVIDER } from './ai-provider.interface.js';
import { AiAdvisoriesRepository } from './ai-advisories.repository.js';
import { AiController } from './ai.controller.js';
import { AiRedactionService } from './ai-redaction.service.js';
import { AiService } from './ai.service.js';
import { DeterministicAiProvider } from './deterministic-ai.provider.js';

@Module({
  imports: [DatabaseModule, AuditModule, TransactionCasesModule, EntitiesModule, WalletsModule],
  controllers: [AiController],
  providers: [
    AiAdvisoriesRepository,
    AiRedactionService,
    AiService,
    DeterministicAiProvider,
    {
      provide: AI_PROVIDER,
      useExisting: DeterministicAiProvider,
    },
  ],
  exports: [AiService, AiAdvisoriesRepository],
})
export class AiModule {}
