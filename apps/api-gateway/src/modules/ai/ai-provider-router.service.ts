import { Inject, Injectable } from '@nestjs/common';

import { loadApiGatewayEnv } from '../../config/env.js';
import {
  type AiProvider,
  type AiProviderPolicy,
  type GeneratedAiAdvisory,
  type TransactionCaseAdvisoryContext,
  AiProviderError,
} from './ai-provider.interface.js';
import { DeterministicAiProvider } from './deterministic-ai.provider.js';
import { OpenAiCompatibleAiProvider } from './openai-compatible.provider.js';

@Injectable()
export class AiProviderRouterService implements AiProvider {
  private readonly env = loadApiGatewayEnv();

  constructor(
    @Inject(DeterministicAiProvider)
    private readonly deterministicProvider: DeterministicAiProvider,
    @Inject(OpenAiCompatibleAiProvider)
    private readonly openAiCompatibleProvider: OpenAiCompatibleAiProvider,
  ) {}

  getPolicy(): AiProviderPolicy {
    return this.env.AI_PROVIDER === 'openai-compatible'
      ? this.openAiCompatibleProvider.getPolicy()
      : this.deterministicProvider.getPolicy();
  }

  async generateTransactionCaseAdvisory(
    context: TransactionCaseAdvisoryContext,
  ): Promise<GeneratedAiAdvisory> {
    if (this.env.AI_PROVIDER !== 'openai-compatible') {
      return this.deterministicProvider.generateTransactionCaseAdvisory(context);
    }

    try {
      return await this.openAiCompatibleProvider.generateTransactionCaseAdvisory(context);
    } catch (error) {
      if (!(error instanceof AiProviderError) || this.env.AI_ADVISORY_FALLBACK !== 'deterministic') {
        throw error;
      }

      const fallback = await this.deterministicProvider.generateTransactionCaseAdvisory(context);
      return {
        ...fallback,
        fallbackUsed: true,
        notice:
          'The OpenAI-compatible provider was unavailable, so TreasuryOS used the deterministic fallback for this advisory.',
      };
    }
  }
}
