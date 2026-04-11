import { Injectable } from '@nestjs/common';

import { loadApiGatewayEnv } from '../../config/env.js';
import type {
  AiProvider,
  AiProviderPolicy,
  GeneratedAiAdvisory,
  TransactionCaseAdvisoryContext,
} from './ai-provider.interface.js';
import { generateChatCompletionsAdvisory } from './chat-completions.provider.js';

// Models that require reasoning to be explicitly disabled to avoid timeouts.
const REASONING_MODELS = ['qwen', 'deepseek-r1', 'deepseek/r1'];

function isReasoningModel(model: string): boolean {
  return REASONING_MODELS.some((prefix) => model.toLowerCase().includes(prefix));
}

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
    const extraBody: Record<string, unknown> = {};

    // Only disable reasoning for models that support/require it (e.g. Qwen, DeepSeek R1).
    // Standard models like Gemma do not accept this field.
    if (isReasoningModel(this.env.AI_ADVISORY_MODEL)) {
      extraBody['reasoning'] = { effort: 'none', exclude: true };
    }

    return generateChatCompletionsAdvisory(context, {
      env: this.env,
      provider: 'openrouter',
      extraBody,
      extraHeaders: {
        'HTTP-Referer': this.env.FRONTEND_URL,
        'X-Title': 'TreasuryOS',
      },
    });
  }
}
