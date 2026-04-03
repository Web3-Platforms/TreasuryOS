import type { AiProviderKind } from '@treasuryos/types';
import { z } from 'zod';

import type { ApiGatewayEnv } from '../../config/env.js';
import {
  AiProviderError,
  type GeneratedAiAdvisory,
  type TransactionCaseAdvisoryContext,
} from './ai-provider.interface.js';

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

export type ExternalAiProviderKind = Exclude<AiProviderKind, 'deterministic'>;

type ChatCompletionsEnv = Pick<
  ApiGatewayEnv,
  | 'AI_ADVISORY_MODEL'
  | 'AI_PROMPT_VERSION'
  | 'AI_PROVIDER_API_KEY'
  | 'AI_PROVIDER_BASE_URL'
  | 'AI_PROVIDER_TIMEOUT_MS'
>;

function stripCodeFence(value: string) {
  const trimmed = value.trim();

  if (!trimmed.startsWith('```')) {
    return trimmed;
  }

  return trimmed.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
}

function normalizeText(
  value: string,
  fieldName: string,
  provider: ExternalAiProviderKind,
  providerLabel: string,
  minLength = 1,
  maxLength = 4000,
) {
  const normalized = value.trim();

  if (normalized.length < minLength || normalized.length > maxLength) {
    throw new AiProviderError(`Invalid ${fieldName} returned by ${providerLabel}.`, {
      code: 'invalid_response',
      operatorMessage: 'The real AI provider returned an invalid advisory payload.',
      provider,
    });
  }

  return normalized;
}

function normalizeList(values: string[], fieldName: string, provider: ExternalAiProviderKind, providerLabel: string) {
  const normalized = values
    .map((value) => value.trim())
    .filter(Boolean)
    .slice(0, 10);

  if (normalized.length === 0) {
    throw new AiProviderError(`Invalid ${fieldName} returned by ${providerLabel}.`, {
      code: 'invalid_response',
      operatorMessage: 'The real AI provider returned an invalid advisory payload.',
      provider,
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

function buildHeaders(apiKey: string, extraHeaders?: Record<string, string | undefined>) {
  const headers = new Headers({
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  });

  for (const [name, value] of Object.entries(extraHeaders ?? {})) {
    if (value) {
      headers.set(name, value);
    }
  }

  return headers;
}

export function describeExternalAiProvider(provider: ExternalAiProviderKind) {
  switch (provider) {
    case 'openrouter':
      return 'OpenRouter';
    case 'openai-compatible':
      return 'OpenAI-compatible provider';
    default:
      return provider;
  }
}

export async function generateChatCompletionsAdvisory(
  context: TransactionCaseAdvisoryContext,
  options: {
    env: ChatCompletionsEnv;
    provider: ExternalAiProviderKind;
    extraHeaders?: Record<string, string | undefined>;
  },
): Promise<GeneratedAiAdvisory> {
  const providerLabel = describeExternalAiProvider(options.provider);

  if (!options.env.AI_PROVIDER_API_KEY) {
    throw new AiProviderError(`Missing ${providerLabel} API key.`, {
      code: 'request_failed',
      operatorMessage: 'The real AI provider is not configured yet.',
      provider: options.provider,
    });
  }

  const startedAt = Date.now();
  let response: Response;

  try {
    response = await fetch(`${options.env.AI_PROVIDER_BASE_URL.replace(/\/+$/, '')}/chat/completions`, {
      method: 'POST',
      headers: buildHeaders(options.env.AI_PROVIDER_API_KEY, options.extraHeaders),
      body: JSON.stringify({
        max_tokens: 700,
        messages: [
          {
            role: 'system',
            content: buildSystemPrompt(),
          },
          {
            role: 'user',
            content: buildUserPrompt(context, options.env.AI_PROMPT_VERSION),
          },
        ],
        model: options.env.AI_ADVISORY_MODEL,
        temperature: 0.2,
      }),
      signal: AbortSignal.timeout(options.env.AI_PROVIDER_TIMEOUT_MS),
    });
  } catch (error) {
    const isTimeout =
      error instanceof Error && (error.name === 'AbortError' || error.name === 'TimeoutError');

    throw new AiProviderError(
      isTimeout
        ? `${providerLabel} request timed out.`
        : `${providerLabel} request failed: ${error instanceof Error ? error.message : String(error)}`,
      {
        code: isTimeout ? 'timeout' : 'request_failed',
        operatorMessage: isTimeout
          ? 'The real AI provider timed out while generating this advisory.'
          : 'The real AI provider could not generate this advisory right now.',
        provider: options.provider,
      },
    );
  }

  if (!response.ok) {
    const errorBody = (await response.text().catch(() => 'Unknown provider error')).slice(0, 500);

    throw new AiProviderError(
      `${providerLabel} returned HTTP ${response.status}: ${errorBody}`,
      {
        code: 'request_failed',
        operatorMessage: 'The real AI provider rejected this advisory request.',
        provider: options.provider,
        statusCode: response.status,
      },
    );
  }

  let payload: z.infer<typeof openAiChatCompletionSchema>;

  try {
    payload = openAiChatCompletionSchema.parse(await response.json());
  } catch (error) {
    throw new AiProviderError(
      `${providerLabel} returned a malformed completion payload: ${error instanceof Error ? error.message : String(error)}`,
      {
        code: 'invalid_response',
        operatorMessage: 'The real AI provider returned an unreadable completion payload.',
        provider: options.provider,
      },
    );
  }

  const rawContent = payload.choices[0]?.message.content;

  if (!rawContent) {
    throw new AiProviderError(`${providerLabel} returned an empty completion.`, {
      code: 'invalid_response',
      operatorMessage: 'The real AI provider returned an empty advisory.',
      provider: options.provider,
    });
  }

  let advisoryPayload: z.infer<typeof advisoryOutputSchema>;

  try {
    advisoryPayload = advisoryOutputSchema.parse(JSON.parse(stripCodeFence(rawContent)));
  } catch (error) {
    throw new AiProviderError(
      `${providerLabel} returned invalid advisory JSON: ${error instanceof Error ? error.message : String(error)}`,
      {
        code: 'invalid_response',
        operatorMessage: 'The real AI provider returned invalid advisory JSON.',
        provider: options.provider,
      },
    );
  }

  return {
    checklist: normalizeList(advisoryPayload.checklist, 'checklist', options.provider, providerLabel),
    confidence:
      advisoryPayload.confidence === null || advisoryPayload.confidence === undefined
        ? undefined
        : Number(advisoryPayload.confidence.toFixed(2)),
    fallbackUsed: false,
    model: payload.model ?? options.env.AI_ADVISORY_MODEL,
    promptVersion: options.env.AI_PROMPT_VERSION,
    provider: options.provider,
    providerLatencyMs: Date.now() - startedAt,
    recommendation: advisoryPayload.recommendation
      ? normalizeText(
          advisoryPayload.recommendation,
          'recommendation',
          options.provider,
          providerLabel,
          10,
          2000,
        )
      : undefined,
    riskFactors: normalizeList(advisoryPayload.riskFactors, 'riskFactors', options.provider, providerLabel),
    summary: normalizeText(advisoryPayload.summary, 'summary', options.provider, providerLabel, 20, 4000),
  };
}
