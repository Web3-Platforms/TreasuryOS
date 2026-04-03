import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { AiAdvisoryEnvelope, AiAdvisoryFeedbackRecord, AuthenticatedUser, EntityRecord } from '@treasuryos/types';
import { z } from 'zod';

import { createResourceId } from '../../common/ids.js';
import { loadApiGatewayEnv } from '../../config/env.js';
import { AuditService } from '../audit/audit.service.js';
import { EntitiesRepository } from '../entities/entities.repository.js';
import { TransactionCasesRepository } from '../transaction-cases/transaction-cases.repository.js';
import { WalletsRepository } from '../wallets/wallets.repository.js';
import { AI_PROVIDER, type AiProvider, AiProviderError } from './ai-provider.interface.js';
import { AiAdvisoriesRepository } from './ai-advisories.repository.js';
import { AiFeedbackRepository } from './ai-feedback.repository.js';
import { AiRedactionService } from './ai-redaction.service.js';
import { describeExternalAiProvider } from './chat-completions.provider.js';
import { DeterministicAiProvider } from './deterministic-ai.provider.js';

const aiFeedbackSchema = z.object({
  disposition: z.enum(['accepted', 'edited', 'dismissed']),
  helpfulness: z.enum(['helpful', 'not_helpful']),
  note: z.string().trim().max(2000).optional(),
});
const FALLBACK_RETRY_WINDOW_MS = 60_000;

function buildRecentFallbackNotice(provider: 'openai-compatible' | 'openrouter') {
  return `The ${describeExternalAiProvider(provider)} was recently unavailable, so TreasuryOS is temporarily reusing the most recent deterministic fallback advisory.`;
}

@Injectable()
export class AiService {
  private readonly env = loadApiGatewayEnv();

  constructor(
    @Inject(AI_PROVIDER)
    private readonly aiProvider: AiProvider,
    @Inject(AiAdvisoriesRepository)
    private readonly aiAdvisoriesRepository: AiAdvisoriesRepository,
    @Inject(AiFeedbackRepository)
    private readonly aiFeedbackRepository: AiFeedbackRepository,
    @Inject(AiRedactionService)
    private readonly aiRedactionService: AiRedactionService,
    @Inject(DeterministicAiProvider)
    private readonly deterministicAiProvider: DeterministicAiProvider,
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
    const providerPolicy = this.aiProvider.getPolicy();
    const deterministicPolicy = this.deterministicAiProvider.getPolicy();
    const existing = await this.aiAdvisoriesRepository.findByResource({
      advisoryType: 'transaction_case_summary',
      resourceId: transactionCase.id,
      resourceType: 'transaction_case',
    });

    if (
      existing &&
      existing.sourceHash === redacted.sourceHash &&
      existing.provider === providerPolicy.provider &&
      existing.model === providerPolicy.model &&
      existing.promptVersion === providerPolicy.promptVersion &&
      !existing.fallbackUsed
    ) {
      return {
        enabled: true,
        advisory: existing,
      };
    }

    const recentFallbackAgeMs = existing ? Date.now() - Date.parse(existing.updatedAt) : Number.POSITIVE_INFINITY;
    if (
      existing &&
      existing.sourceHash === redacted.sourceHash &&
      existing.fallbackUsed &&
      this.env.AI_PROVIDER !== 'deterministic' &&
      this.env.AI_ADVISORY_FALLBACK === 'deterministic' &&
      existing.provider === deterministicPolicy.provider &&
      existing.model === deterministicPolicy.model &&
      existing.promptVersion === deterministicPolicy.promptVersion &&
      Number.isFinite(recentFallbackAgeMs) &&
      recentFallbackAgeMs < FALLBACK_RETRY_WINDOW_MS
    ) {
      return {
        enabled: true,
        advisory: existing,
        notice: buildRecentFallbackNotice(this.env.AI_PROVIDER),
      };
    }

    let generated;

    try {
      generated = await this.aiProvider.generateTransactionCaseAdvisory(redacted.context);
    } catch (error) {
      if (!(error instanceof AiProviderError)) {
        throw error;
      }

      await this.auditService.record({
        action: 'ai_advisory.generation_failed',
        actorEmail: 'system@treasuryos.local',
        actorId: 'system',
        metadata: {
          code: error.details.code,
          provider: error.details.provider,
          statusCode: error.details.statusCode,
          transactionCaseId: transactionCase.id,
          transactionReference: transactionCase.transactionReference,
        },
        resourceId: transactionCase.id,
        resourceType: 'transaction_case',
        summary: `AI advisory generation failed for transaction case ${transactionCase.transactionReference}`,
      });

      return {
        enabled: true,
        advisory: null,
        reason: error.details.operatorMessage,
      };
    }

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
      provider: generated.provider,
      promptVersion: generated.promptVersion,
      fallbackUsed: generated.fallbackUsed,
      providerLatencyMs: generated.providerLatencyMs,
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
        fallbackUsed: savedAdvisory.fallbackUsed,
        model: savedAdvisory.model,
        promptVersion: savedAdvisory.promptVersion,
        provider: savedAdvisory.provider,
        providerLatencyMs: savedAdvisory.providerLatencyMs,
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
      notice: generated.notice,
    };
  }

  async submitAdvisoryFeedback(
    advisoryId: string,
    input: {
      helpfulness: string;
      disposition: string;
      note?: string;
    },
    actor: AuthenticatedUser,
  ): Promise<AiAdvisoryFeedbackRecord> {
    const parsedInput = aiFeedbackSchema.parse({
      ...input,
      note: input.note?.trim() || undefined,
    });
    const advisory = await this.requireAdvisory(advisoryId);
    const now = new Date().toISOString();

    const feedback = await this.aiFeedbackRepository.save({
      id: createResourceId('aifb'),
      advisoryId: advisory.id,
      advisoryModel: advisory.model,
      advisoryPromptVersion: advisory.promptVersion,
      advisoryProvider: advisory.provider,
      advisorySourceHash: advisory.sourceHash,
      advisoryType: advisory.advisoryType,
      actorEmail: actor.email,
      actorId: actor.id,
      createdAt: now,
      disposition: parsedInput.disposition,
      helpfulness: parsedInput.helpfulness,
      note: parsedInput.note,
      resourceId: advisory.resourceId,
      resourceType: advisory.resourceType,
      updatedAt: now,
    });

    await this.auditService.record({
      action: 'ai_feedback.recorded',
      actor,
      metadata: {
        advisoryId: advisory.id,
        advisoryModel: advisory.model,
        advisoryPromptVersion: advisory.promptVersion,
        advisoryProvider: advisory.provider,
        advisoryResourceId: advisory.resourceId,
        advisoryResourceType: advisory.resourceType,
        disposition: feedback.disposition,
        feedbackId: feedback.id,
        helpfulness: feedback.helpfulness,
      },
      resourceId: advisory.id,
      resourceType: 'ai_advisory',
      summary: `AI feedback recorded for advisory ${advisory.id}`,
    });

    return feedback;
  }

  private async requireAdvisory(advisoryId: string) {
    const advisory = await this.aiAdvisoriesRepository.findById(advisoryId);

    if (!advisory) {
      throw new NotFoundException(`AI advisory ${advisoryId} not found`);
    }

    return advisory;
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
