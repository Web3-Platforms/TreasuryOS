import { Injectable } from '@nestjs/common';
import { z } from 'zod';

import { loadApiGatewayEnv } from '../../config/env.js';
import type {
  AiProvider,
  AiProviderPolicy,
  GeneratedAiAdvisory,
  TransactionCaseAdvisoryContext,
} from './ai-provider.interface.js';
import { AiProviderError } from './ai-provider.interface.js';

const advisoryOutputSchema = z.object({
  checklist: z.array(z.string()).min(1).max(10),
  confidence: z.number().min(0).max(1).optional().nullable(),
  recommendation: z.string().optional().nullable(),
  riskFactors: z.array(z.string()).min(1).max(10),
  summary: z.string().min(1),
});

const openAiChatCompletionSchema = z.object({
  choices: z.array(
    z.object({
      message: z.object({
        content: z.string().nullable().optional(),
      }),
    }),
  ).min(1),
  model: z.string().optional(),
});

function stripCodeFence(value: string) {
  const trimmed = value.trim();

  if (!trimmed.startsWith('```')) {
    return trimmed;
  }

  return trimmed.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
}

function normalizeText(value: string, fieldName: string, minLength = 1, maxLength = 4000) {
  const normalized = value.trim();

  if (normalized.length < minLength || normalized.length > maxLength) {
    throw new AiProviderError(`Invalid ${fieldName} returned by OpenAI-compatible provider.`, {
      code: 'invalid_response',
      operatorMessage: 'The real AI provider returned an invalid advisory payload.',
      provider: 'openai-compatible',
    });
  }

  return normalized;
}

function normalizeList(values: string[], fieldName: string) {
  const normalized = values
    .map((value) => value.trim())
    .filter(Boolean)
    .slice(0, 10);

  if (normalized.length === 0) {
    throw new AiProviderError(`Invalid ${fieldName} returned by OpenAI-compatible provider.`, {
      code: 'invalid_response',
      operatorMessage: 'The real AI provider returned an invalid advisory payload.',
      provider: 'openai-compatible',
    });
  }

  return normalized;
}

function buildSystemPrompt() {
  return [
    'You are TreasuryOS, a read-only institutional compliance advisory assistant.',
    'You must never recommend autonomous approval, rejection, escalation, signing, or workflow bypass.',
    'Return JSON only with exactly these keys: summary, recommendation, riskFactors, checklist, confidence.',
    'summary must be a concise operator-facing narrative.',
    'recommendation must stay advisory-only and human-in-the-loop.',
    'riskFactors must be an array of short strings grounded in the provided case context.',
    'checklist must be an array of concrete human review steps.',
    'confidence must be a number between 0 and 1.',
    'Do not include markdown, code fences, or extra keys.',
  ].join(' ');
}

function buildUserPrompt(context: TransactionCaseAdvisoryContext, promptVersion: string) {
  return JSON.stringify(
    {
      promptVersion,
      task: 'Generate a transaction-case advisory for a human compliance reviewer.',
      context,
    },
    null,
    2,
  );
}

@Injectable()
export class OpenAiCompatibleAiProvider implements AiProvider {
  private readonly env = loadApiGatewayEnv();

  getPolicy(): AiProviderPolicy {
    return {
      model: this.env.AI_ADVISORY_MODEL,
      promptVersion: this.env.AI_PROMPT_VERSION,
      provider: 'openai-compatible',
    };
  }

  async generateTransactionCaseAdvisory(
    context: TransactionCaseAdvisoryContext,
  ): Promise<GeneratedAiAdvisory> {
    if (!this.env.AI_PROVIDER_API_KEY) {
      throw new AiProviderError('Missing OpenAI-compatible provider API key.', {
        code: 'request_failed',
        operatorMessage: 'The real AI provider is not configured yet.',
        provider: 'openai-compatible',
      });
    }

    const startedAt = Date.now();
    let response: Response;

    try {
      response = await fetch(`${this.env.AI_PROVIDER_BASE_URL.replace(/\/+$/, '')}/chat/completions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.env.AI_PROVIDER_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          max_tokens: 700,
          messages: [
            {
              role: 'system',
              content: buildSystemPrompt(),
            },
            {
              role: 'user',
              content: buildUserPrompt(context, this.env.AI_PROMPT_VERSION),
            },
          ],
          model: this.env.AI_ADVISORY_MODEL,
          temperature: 0.2,
        }),
        signal: AbortSignal.timeout(this.env.AI_PROVIDER_TIMEOUT_MS),
      });
    } catch (error) {
      const isTimeout =
        error instanceof Error && (error.name === 'AbortError' || error.name === 'TimeoutError');

      throw new AiProviderError(
        isTimeout
          ? 'OpenAI-compatible provider request timed out.'
          : `OpenAI-compatible provider request failed: ${error instanceof Error ? error.message : String(error)}`,
        {
          code: isTimeout ? 'timeout' : 'request_failed',
          operatorMessage: isTimeout
            ? 'The real AI provider timed out while generating this advisory.'
            : 'The real AI provider could not generate this advisory right now.',
          provider: 'openai-compatible',
        },
      );
    }

    if (!response.ok) {
      const errorBody = (await response.text().catch(() => 'Unknown provider error')).slice(0, 500);

      throw new AiProviderError(
        `OpenAI-compatible provider returned HTTP ${response.status}: ${errorBody}`,
        {
          code: 'request_failed',
          operatorMessage: 'The real AI provider rejected this advisory request.',
          provider: 'openai-compatible',
          statusCode: response.status,
        },
      );
    }

    let payload: z.infer<typeof openAiChatCompletionSchema>;

    try {
      payload = openAiChatCompletionSchema.parse(await response.json());
    } catch (error) {
      throw new AiProviderError(
        `OpenAI-compatible provider returned a malformed completion payload: ${error instanceof Error ? error.message : String(error)}`,
        {
          code: 'invalid_response',
          operatorMessage: 'The real AI provider returned an unreadable completion payload.',
          provider: 'openai-compatible',
        },
      );
    }

    const rawContent = payload.choices[0]?.message.content;

    if (!rawContent) {
      throw new AiProviderError('OpenAI-compatible provider returned an empty completion.', {
        code: 'invalid_response',
        operatorMessage: 'The real AI provider returned an empty advisory.',
        provider: 'openai-compatible',
      });
    }

    let advisoryPayload: z.infer<typeof advisoryOutputSchema>;

    try {
      advisoryPayload = advisoryOutputSchema.parse(JSON.parse(stripCodeFence(rawContent)));
    } catch (error) {
      throw new AiProviderError(
        `OpenAI-compatible provider returned invalid advisory JSON: ${error instanceof Error ? error.message : String(error)}`,
        {
          code: 'invalid_response',
          operatorMessage: 'The real AI provider returned invalid advisory JSON.',
          provider: 'openai-compatible',
        },
      );
    }

    return {
      checklist: normalizeList(advisoryPayload.checklist, 'checklist'),
      confidence:
        advisoryPayload.confidence === null || advisoryPayload.confidence === undefined
          ? undefined
          : Number(advisoryPayload.confidence.toFixed(2)),
      fallbackUsed: false,
      model: payload.model ?? this.env.AI_ADVISORY_MODEL,
      promptVersion: this.env.AI_PROMPT_VERSION,
      provider: 'openai-compatible',
      providerLatencyMs: Date.now() - startedAt,
      recommendation: advisoryPayload.recommendation
        ? normalizeText(advisoryPayload.recommendation, 'recommendation', 10, 2000)
        : undefined,
      riskFactors: normalizeList(advisoryPayload.riskFactors, 'riskFactors'),
      summary: normalizeText(advisoryPayload.summary, 'summary', 20, 4000),
    };
  }
}
