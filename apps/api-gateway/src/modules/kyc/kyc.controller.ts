import {
  Controller,
  Headers,
  HttpCode,
  Inject,
  Post,
  RawBody,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';

import { loadApiGatewayEnv } from '../../config/env.js';
import { AuditService } from '../audit/audit.service.js';
import { Public } from '../auth/public.decorator.js';
import { EntitiesService } from '../entities/entities.service.js';
import { SumsubService } from './sumsub.service.js';

@Controller('kyc')
export class KycController {
  private readonly env = loadApiGatewayEnv();

  constructor(
    @Inject(SumsubService)
    private readonly sumsubService: SumsubService,
    @Inject(EntitiesService)
    private readonly entitiesService: EntitiesService,
    @Inject(AuditService)
    private readonly auditService: AuditService,
  ) {}

  @Public()
  @Post('webhooks/sumsub')
  @HttpCode(200)
  async handleSumsubWebhook(
    @RawBody() rawBody: Buffer | undefined,
    @Headers() headers: Record<string, string | string[] | undefined>,
  ) {
    if (!this.env.KYC_SUMSUB_ENABLED) {
      throw new ServiceUnavailableException('Sumsub KYC is coming soon');
    }

    try {
      const verifiedWebhook = this.sumsubService.verifyWebhook(rawBody, headers);
      const result = await this.entitiesService.applyVerifiedKycWebhook(verifiedWebhook.payload, {
        digest: verifiedWebhook.digest,
        digestAlg: verifiedWebhook.digestAlg,
      });

      return {
        duplicate: result.duplicate,
        entityId: result.entity?.id ?? null,
        received: true,
        stale: result.stale,
        verified: true,
      };
    } catch (error) {
      await this.auditService.record({
        action: 'kyc.webhook.rejected',
        actorId: 'sumsub',
        actorEmail: 'webhook@sumsub.local',
        resourceType: 'kyc_webhook',
        resourceId: 'sumsub',
        summary: 'Rejected Sumsub webhook because verification failed',
        metadata: {
          error: error instanceof Error ? error.message : String(error),
        },
      });

      if (error instanceof UnauthorizedException) {
        throw error;
      }

      throw error;
    }
  }
}
