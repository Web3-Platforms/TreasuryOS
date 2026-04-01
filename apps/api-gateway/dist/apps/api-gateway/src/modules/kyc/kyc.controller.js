var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { Controller, Headers, HttpCode, Inject, Post, RawBody, ServiceUnavailableException, UnauthorizedException, } from '@nestjs/common';
import { loadApiGatewayEnv } from '../../config/env.js';
import { AuditService } from '../audit/audit.service.js';
import { Public } from '../auth/public.decorator.js';
import { EntitiesService } from '../entities/entities.service.js';
import { SumsubService } from './sumsub.service.js';
let KycController = class KycController {
    sumsubService;
    entitiesService;
    auditService;
    env = loadApiGatewayEnv();
    constructor(sumsubService, entitiesService, auditService) {
        this.sumsubService = sumsubService;
        this.entitiesService = entitiesService;
        this.auditService = auditService;
    }
    async handleSumsubWebhook(rawBody, headers) {
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
        }
        catch (error) {
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
};
__decorate([
    Public(),
    Post('webhooks/sumsub'),
    HttpCode(200),
    __param(0, RawBody()),
    __param(1, Headers()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], KycController.prototype, "handleSumsubWebhook", null);
KycController = __decorate([
    Controller('kyc'),
    __param(0, Inject(SumsubService)),
    __param(1, Inject(EntitiesService)),
    __param(2, Inject(AuditService)),
    __metadata("design:paramtypes", [SumsubService,
        EntitiesService,
        AuditService])
], KycController);
export { KycController };
//# sourceMappingURL=kyc.controller.js.map