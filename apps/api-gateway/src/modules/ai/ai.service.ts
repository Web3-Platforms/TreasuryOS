import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { AiAdvisoryEnvelope, EntityRecord } from '@treasuryos/types';

import { createResourceId } from '../../common/ids.js';
import { loadApiGatewayEnv } from '../../config/env.js';
import { AuditService } from '../audit/audit.service.js';
import { EntitiesRepository } from '../entities/entities.repository.js';
import { TransactionCasesRepository } from '../transaction-cases/transaction-cases.repository.js';
import { WalletsRepository } from '../wallets/wallets.repository.js';
import { AI_PROVIDER, type AiProvider } from './ai-provider.interface.js';
import { AiAdvisoriesRepository } from './ai-advisories.repository.js';
import { AiRedactionService } from './ai-redaction.service.js';

@Injectable()
export class AiService {
  private readonly env = loadApiGatewayEnv();

  constructor(
    @Inject(AI_PROVIDER)
    private readonly aiProvider: AiProvider,
    @Inject(AiAdvisoriesRepository)
    private readonly aiAdvisoriesRepository: AiAdvisoriesRepository,
    @Inject(AiRedactionService)
    private readonly aiRedactionService: AiRedactionService,
    @Inject(TransactionCasesRepository)
    private readonly transactionCasesRepository: TransactionCasesRepository,
    @Inject(EntitiesRepository)
    private readonly entitiesRepository: EntitiesRepository,
    @Inject(WalletsRepository)
    private readonly walletsRepository: WalletsRepository,
    @Inject(AuditService)
    private readonly auditService: AuditService,
  ) {}

  async getTransactionCaseAdvisory(caseId: string): Promise<AiAdvisoryEnvelope> {
    if (!this.env.AI_ADVISORY_ENABLED) {
      return {
        enabled: false,
        advisory: null,
        reason: 'AI advisories are disabled for this environment.',
      };
    }

    const transactionCase = await this.requireCase(caseId);
    const entity = await this.requireEntity(transactionCase.entityId);
    const wallet = transactionCase.walletId
      ? await this.walletsRepository.findById(transactionCase.walletId)
      : undefined;

    const redacted = this.aiRedactionService.redactTransactionCase({
      entity,
      transactionCase,
      wallet,
    });
    const existing = await this.aiAdvisoriesRepository.findByResource({
      advisoryType: 'transaction_case_summary',
      resourceId: transactionCase.id,
      resourceType: 'transaction_case',
    });

    if (existing && existing.sourceHash === redacted.sourceHash) {
      return {
        enabled: true,
        advisory: existing,
      };
    }

    const generated = await this.aiProvider.generateTransactionCaseAdvisory(redacted.context);
    const now = new Date().toISOString();
    const savedAdvisory = await this.aiAdvisoriesRepository.save({
      id: existing?.id ?? createResourceId('aiadv'),
      advisoryType: 'transaction_case_summary',
      resourceType: 'transaction_case',
      resourceId: transactionCase.id,
      summary: generated.summary,
      recommendation: generated.recommendation,
      riskFactors: generated.riskFactors,
      checklist: generated.checklist,
      confidence: generated.confidence,
      model: generated.model,
      redactionProfile: redacted.redactionProfile,
      sourceHash: redacted.sourceHash,
      generatedAt: now,
      updatedAt: now,
    });

    await this.auditService.record({
      action: existing ? 'ai_advisory.regenerated' : 'ai_advisory.generated',
      actorEmail: 'system@treasuryos.local',
      actorId: 'system',
      metadata: {
        advisoryType: savedAdvisory.advisoryType,
        model: savedAdvisory.model,
        redactionProfile: savedAdvisory.redactionProfile,
        transactionCaseId: transactionCase.id,
        transactionReference: transactionCase.transactionReference,
      },
      resourceId: savedAdvisory.id,
      resourceType: 'ai_advisory',
      summary: `${existing ? 'Regenerated' : 'Generated'} AI advisory for transaction case ${transactionCase.transactionReference}`,
    });

    return {
      enabled: true,
      advisory: savedAdvisory,
    };
  }

  private async requireCase(caseId: string) {
    const transactionCase = await this.transactionCasesRepository.findById(caseId);

    if (!transactionCase) {
      throw new NotFoundException(`Transaction case ${caseId} not found`);
    }

    return transactionCase;
  }

  private async requireEntity(entityId: string): Promise<EntityRecord> {
    const entity = await this.entitiesRepository.findById(entityId);

    if (!entity) {
      throw new NotFoundException(`Entity ${entityId} not found`);
    }

    return entity;
  }
}
