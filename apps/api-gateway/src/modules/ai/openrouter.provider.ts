import { Injectable } from '@nestjs/common';

import { loadApiGatewayEnv } from '../../config/env.js';
import type {
  AiProvider,
  AiProviderPolicy,
  GeneratedAiAdvisory,
  TransactionCaseAdvisoryContext,
} from './ai-provider.interface.js';
import { generateChatCompletionsAdvisory } from './chat-completions.provider.js';

@Injectable()
export class OpenRouterAiProvider implements AiProvider {
  private readonly env = loadApiGatewayEnv();

  getPolicy(): AiProviderPolicy {
    return {
      model: this.env.AI_ADVISORY_MODEL,
      promptVersion: this.env.AI_PROMPT_VERSION,
      provider: 'openrouter',
    };
  }

  async generateTransactionCaseAdvisory(
    context: TransactionCaseAdvisoryContext,
  ): Promise<GeneratedAiAdvisory> {
    return generateChatCompletionsAdvisory(context, {
      env: this.env,
      provider: 'openrouter',
      extraHeaders: {
        'HTTP-Referer': this.env.FRONTEND_URL,
        'X-Title': 'TreasuryOS',
      },
    });
  }
}
