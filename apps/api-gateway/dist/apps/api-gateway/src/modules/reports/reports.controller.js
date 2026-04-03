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
import { Body, Controller, Get, Inject, Param, Post, Query, Req, Res, } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { UserRole } from '@treasuryos/types';
import { extractActor } from '../../common/http-request.js';
import { Roles } from '../auth/roles.decorator.js';
import { ReportsService } from './reports.service.js';
let ReportsController = class ReportsController {
    reportsService;
    constructor(reportsService) {
        this.reportsService = reportsService;
    }
    async listReports(query) {
        return {
            reports: await this.reportsService.listReports(query),
        };
    }
    getReport(reportId) {
        return this.reportsService.getReport(reportId);
    }
    generateMonthlyReport(body, request) {
        return this.reportsService.generateMonthlyReport(body, extractActor(request));
    }
    async downloadReport(reportId, response) {
        const artifact = await this.reportsService.getReportArtifact(reportId);
        response.setHeader('content-type', artifact.mimeType);
        response.setHeader('content-disposition', `attachment; filename="${artifact.downloadName}"`);
        response.send(artifact.contents);
    }
};
__decorate([
    Get(),
    Roles(UserRole.Admin, UserRole.ComplianceOfficer, UserRole.Auditor),
    __param(0, Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "listReports", null);
__decorate([
    Get(':reportId'),
    Roles(UserRole.Admin, UserRole.ComplianceOfficer, UserRole.Auditor),
    __param(0, Param('reportId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "getReport", null);
__decorate([
    Post(),
    Roles(UserRole.Admin, UserRole.ComplianceOfficer, UserRole.Auditor),
    __param(0, Body()),
    __param(1, Req()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "generateMonthlyReport", null);
__decorate([
    Get(':reportId/download'),
    Roles(UserRole.Admin, UserRole.ComplianceOfficer, UserRole.Auditor),
    Throttle({ reports: { ttl: 60000, limit: 20 } }),
    __param(0, Param('reportId')),
    __param(1, Res()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "downloadReport", null);
ReportsController = __decorate([
    Controller('reports'),
    __param(0, Inject(ReportsService)),
    __metadata("design:paramtypes", [ReportsService])
], ReportsController);
export { ReportsController };
//# sourceMappingURL=reports.controller.js.map