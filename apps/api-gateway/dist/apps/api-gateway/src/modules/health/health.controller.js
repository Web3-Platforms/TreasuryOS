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
import { Controller, Get, Inject, ServiceUnavailableException } from '@nestjs/common';
import { buildInfo } from '../../common/build-info.js';
import { loadApiGatewayEnv } from '../../config/env.js';
import { Public } from '../auth/public.decorator.js';
import { DatabaseService } from '../database/database.service.js';
import { WalletSyncReadinessService } from '../wallets/wallet-sync-readiness.service.js';
let HealthController = class HealthController {
    databaseService;
    walletSyncReadinessService;
    constructor(databaseService, walletSyncReadinessService) {
        this.databaseService = databaseService;
        this.walletSyncReadinessService = walletSyncReadinessService;
    }
    async getHealth() {
        const env = loadApiGatewayEnv();
        await this.assertDatabaseReady();
        return {
            ...this.buildBasePayload(),
            scope: {
                customerProfile: env.PILOT_CUSTOMER_PROFILE,
                institutionId: env.PILOT_INSTITUTION_ID,
                queueName: env.REDIS_QUEUE_NAME,
            },
            walletSync: this.walletSyncReadinessService.getStartupReadiness(),
        };
    }
    getLive() {
        return this.buildBasePayload();
    }
    async getReady() {
        await this.assertDatabaseReady();
        const walletSync = await this.walletSyncReadinessService.getReadiness();
        if (!walletSync.ready) {
            throw new ServiceUnavailableException({
                status: 'error',
                message: 'Wallet sync readiness failed',
                checks: {
                    database: 'ok',
                    walletSync,
                },
            });
        }
        return {
            ...this.buildBasePayload(),
            checks: {
                database: 'ok',
                walletSync,
            },
        };
    }
    buildBasePayload() {
        return {
            status: 'ok',
            service: buildInfo.service,
            version: buildInfo.version,
            timestamp: new Date().toISOString(),
        };
    }
    async assertDatabaseReady() {
        try {
            await this.databaseService.getPool().query('SELECT 1');
        }
        catch (error) {
            throw new ServiceUnavailableException({
                status: 'error',
                message: 'Database connection failed',
                error: error instanceof Error ? error.message : String(error),
            });
        }
    }
};
__decorate([
    Public(),
    Get(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], HealthController.prototype, "getHealth", null);
__decorate([
    Public(),
    Get('live'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], HealthController.prototype, "getLive", null);
__decorate([
    Public(),
    Get('ready'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], HealthController.prototype, "getReady", null);
HealthController = __decorate([
    Controller('health'),
    __param(0, Inject(DatabaseService)),
    __param(1, Inject(WalletSyncReadinessService)),
    __metadata("design:paramtypes", [Object, Object])
], HealthController);
export { HealthController };
//# sourceMappingURL=health.controller.js.map