var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { buildInfo } from '../../common/build-info.js';
import { loadApiGatewayEnv } from '../../config/env.js';
import { Public } from '../auth/public.decorator.js';
import { DatabaseService } from '../database/database.service.js';
let HealthController = class HealthController {
    databaseService;
    constructor(databaseService) {
        this.databaseService = databaseService;
    }
    async getHealth() {
        const env = loadApiGatewayEnv();
        try {
            await this.databaseService.pool.query('SELECT 1');
        }
        catch (error) {
            throw new ServiceUnavailableException({
                status: 'error',
                message: 'Database connection failed',
                error: error instanceof Error ? error.message : String(error),
            });
        }
        return {
            status: 'ok',
            service: buildInfo.service,
            version: buildInfo.version,
            timestamp: new Date().toISOString(),
            scope: {
                customerProfile: env.PILOT_CUSTOMER_PROFILE,
                institutionId: env.PILOT_INSTITUTION_ID,
                queueName: env.REDIS_QUEUE_NAME,
            },
        };
    }
};
__decorate([
    Public(),
    Get(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], HealthController.prototype, "getHealth", null);
HealthController = __decorate([
    Controller('health'),
    __metadata("design:paramtypes", [DatabaseService])
], HealthController);
export { HealthController };
//# sourceMappingURL=health.controller.js.map