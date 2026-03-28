import crypto from 'node:crypto';

import {
  BadRequestException,
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { z } from 'zod';

import { loadApiGatewayEnv } from '../../config/env.js';

const reviewAnswerSchema = z.enum(['GREEN', 'RED']);

const applicantResponseSchema = z
  .object({
    id: z.string().optional(),
    applicantId: z.string().optional(),
  })
  .passthrough();

const webhookPayloadSchema = z
  .object({
    applicantId: z.string().optional(),
    clientId: z.string().optional(),
    correlationId: z.string().optional(),
    createdAtMs: z.string().optional(),
    externalUserId: z.string().optional(),
    inspectionId: z.string().optional(),
    levelName: z.string().optional(),
    reviewResult: z
      .object({
        clientComment: z.string().optional(),
        moderationComment: z.string().optional(),
        rejectLabels: z.array(z.string()).optional(),
        reviewAnswer: reviewAnswerSchema.optional(),
      })
      .partial()
      .optional(),
    reviewStatus: z.string().optional(),
    sandboxMode: z.boolean().optional(),
    type: z.string(),
  })
  .passthrough();

type SumsubWebhookPayload = z.infer<typeof webhookPayloadSchema>;

const digestAlgorithms = {
  HMAC_SHA1_HEX: 'sha1',
  HMAC_SHA256_HEX: 'sha256',
  HMAC_SHA512_HEX: 'sha512',
} as const;

@Injectable()
export class SumsubService {
  private readonly env = loadApiGatewayEnv();
  private readonly baseUrl = 'https://api.sumsub.com';

  async createApplicant(externalUserId: string) {
    if (!this.env.SUMSUB_APP_TOKEN || !this.env.SUMSUB_SECRET_KEY) {
      throw new ServiceUnavailableException('Sumsub API credentials are not configured');
    }

    const endpoint = `/resources/applicants?levelName=${encodeURIComponent(this.env.SUMSUB_LEVEL_NAME)}`;
    const body = JSON.stringify({
      externalUserId,
      type: 'company',
    });
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: this.createSignedHeaders('POST', endpoint, body),
      body,
    });

    if (!response.ok) {
      throw new ServiceUnavailableException(
        `Sumsub applicant creation failed with status ${response.status}`,
      );
    }

    const parsedResponse = applicantResponseSchema.parse(await response.json());
    const applicantId = parsedResponse.id ?? parsedResponse.applicantId;

    if (!applicantId) {
      throw new ServiceUnavailableException('Sumsub applicant creation did not return an applicant id');
    }

    return {
      applicantId,
      raw: parsedResponse,
    };
  }

  verifyWebhook(rawBody: Buffer | undefined, headers: Record<string, string | string[] | undefined>) {
    if (!rawBody || rawBody.length === 0) {
      throw new BadRequestException('Missing raw webhook body');
    }

    if (!this.env.SUMSUB_WEBHOOK_SECRET) {
      throw new ServiceUnavailableException('SUMSUB_WEBHOOK_SECRET is not configured');
    }

    const digest = this.readHeader(headers, 'x-payload-digest');
    const digestAlgHeader = this.readHeader(headers, 'x-payload-digest-alg') ?? 'HMAC_SHA256_HEX';
    const digestAlgorithm = digestAlgorithms[digestAlgHeader as keyof typeof digestAlgorithms];

    if (!digest || !digestAlgorithm) {
      throw new UnauthorizedException('Missing or unsupported Sumsub webhook signature headers');
    }

    const calculatedDigest = crypto
      .createHmac(digestAlgorithm, this.env.SUMSUB_WEBHOOK_SECRET)
      .update(rawBody)
      .digest('hex');

    const expected = Buffer.from(calculatedDigest.toLowerCase());
    const actual = Buffer.from(digest.toLowerCase());

    if (expected.length !== actual.length || !crypto.timingSafeEqual(expected, actual)) {
      throw new UnauthorizedException('Invalid Sumsub webhook signature');
    }

    const payload = webhookPayloadSchema.parse(JSON.parse(rawBody.toString('utf8')));

    return {
      digest: digest.toLowerCase(),
      digestAlg: digestAlgHeader,
      payload,
    };
  }

  private createSignedHeaders(method: string, endpoint: string, body: string) {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const signature = crypto
      .createHmac('sha256', this.env.SUMSUB_SECRET_KEY!)
      .update(timestamp + method.toUpperCase() + endpoint + body)
      .digest('hex');

    return {
      'Content-Type': 'application/json',
      'X-App-Access-Sig': signature,
      'X-App-Access-Ts': timestamp,
      'X-App-Token': this.env.SUMSUB_APP_TOKEN!,
    };
  }

  private readHeader(headers: Record<string, string | string[] | undefined>, key: string) {
    const value = headers[key] ?? headers[key.toLowerCase()];

    if (Array.isArray(value)) {
      return value[0];
    }

    return value;
  }
}
