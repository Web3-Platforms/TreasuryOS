import { Inject, Injectable } from '@nestjs/common';

import { loadApiGatewayEnv } from '../../config/env.js';
import {
  type AiProvider,
  type AiProviderPolicy,
  type GeneratedAiAdvisory,
  type TransactionCaseAdvisoryContext,
  AiProviderError,
} from './ai-provider.interface.js';
import { describeExternalAiProvider } from './chat-completions.provider.js';
import { DeterministicAiProvider } from './deterministic-ai.provider.js';
import { OpenAiCompatibleAiProvider } from './openai-compatible.provider.js';
import { OpenRouterAiProvider } from './openrouter.provider.js';

@Injectable()
export class AiProviderRouterService implements AiProvider {
  private readonly env = loadApiGatewayEnv();

  constructor(
    @Inject(DeterministicAiProvider)
    private readonly deterministicProvider: DeterministicAiProvider,
    @Inject(OpenAiCompatibleAiProvider)
    private readonly openAiCompatibleProvider: OpenAiCompatibleAiProvider,
    @Inject(OpenRouterAiProvider)
    private readonly openRouterProvider: OpenRouterAiProvider,
  ) {}

  getPolicy(): AiProviderPolicy {
    switch (this.env.AI_PROVIDER) {
      case 'openai-compatible':
        return this.openAiCompatibleProvider.getPolicy();
      case 'openrouter':
        return this.openRouterProvider.getPolicy();
      default:
        return this.deterministicProvider.getPolicy();
    }
  }

  async generateTransactionCaseAdvisory(
    context: TransactionCaseAdvisoryContext,
  ): Promise<GeneratedAiAdvisory> {
    if (this.env.AI_PROVIDER === 'deterministic') {
      return this.deterministicProvider.generateTransactionCaseAdvisory(context);
    }

    const externalProvider =
      this.env.AI_PROVIDER === 'openrouter'
        ? this.openRouterProvider
        : this.openAiCompatibleProvider;

    try {
      return await externalProvider.generateTransactionCaseAdvisory(context);
    } catch (error) {
      if (!(error instanceof AiProviderError) || this.env.AI_ADVISORY_FALLBACK !== 'deterministic') {
        throw error;
      }

      const fallback = await this.deterministicProvider.generateTransactionCaseAdvisory(context);
      return {
        ...fallback,
        fallbackUsed: true,
        notice:
          `The ${describeExternalAiProvider(this.env.AI_PROVIDER)} was unavailable, so TreasuryOS used the deterministic fallback for this advisory.`,
      };
    }
  }
}
