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
import { Controller, Get, Inject, Query } from '@nestjs/common';
import { UserRole } from '@treasuryos/types';
import { z } from 'zod';
import { Roles } from '../auth/roles.decorator.js';
import { AuditService } from './audit.service.js';
const querySchema = z.object({
    limit: z.coerce.number().int().min(1).max(250).default(50),
});
let AuditController = class AuditController {
    auditService;
    constructor(auditService) {
        this.auditService = auditService;
    }
    async listEvents(query) {
        const { limit } = querySchema.parse(query);
        return {
            events: await this.auditService.listRecent(limit),
            limit,
        };
    }
};
__decorate([
    Get('events'),
    Roles(UserRole.Admin, UserRole.ComplianceOfficer, UserRole.Auditor),
    __param(0, Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuditController.prototype, "listEvents", null);
AuditController = __decorate([
    Controller('audit'),
    __param(0, Inject(AuditService)),
    __metadata("design:paramtypes", [AuditService])
], AuditController);
export { AuditController };
//# sourceMappingURL=audit.controller.js.map