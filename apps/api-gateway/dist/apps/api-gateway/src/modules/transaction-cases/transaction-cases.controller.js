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
import { Body, Controller, Get, HttpCode, Inject, Param, Post, Query, Req, } from '@nestjs/common';
import { UserRole } from '@treasuryos/types';
import { extractActor } from '../../common/http-request.js';
import { Roles } from '../auth/roles.decorator.js';
import { TransactionCasesService } from './transaction-cases.service.js';
import { ScreenTransactionDto } from './dto/screen-transaction.dto.js';
import { DecisionTransitionDto } from './dto/decision-transition.dto.js';
import { ListCasesQueryDto } from './dto/list-cases-query.dto.js';
import { ReviewTransitionDto } from './dto/review-transition.dto.js';
let TransactionCasesController = class TransactionCasesController {
    transactionCasesService;
    constructor(transactionCasesService) {
        this.transactionCasesService = transactionCasesService;
    }
    async listCases(query) {
        return {
            cases: await this.transactionCasesService.listCases(query),
        };
    }
    getCase(caseId) {
        return this.transactionCasesService.getCase(caseId);
    }
    screenTransaction(body, request) {
        return this.transactionCasesService.screenTransaction(body, extractActor(request));
    }
    markUnderReview(caseId, body, request) {
        return this.transactionCasesService.markUnderReview(caseId, body, extractActor(request));
    }
    approveCase(caseId, body, request) {
        return this.transactionCasesService.approveCase(caseId, body, extractActor(request));
    }
    rejectCase(caseId, body, request) {
        return this.transactionCasesService.rejectCase(caseId, body, extractActor(request));
    }
    escalateCase(caseId, body, request) {
        return this.transactionCasesService.escalateCase(caseId, body, extractActor(request));
    }
};
__decorate([
    Get(),
    Roles(UserRole.Admin, UserRole.ComplianceOfficer, UserRole.Auditor),
    __param(0, Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ListCasesQueryDto]),
    __metadata("design:returntype", Promise)
], TransactionCasesController.prototype, "listCases", null);
__decorate([
    Get(':caseId'),
    Roles(UserRole.Admin, UserRole.ComplianceOfficer, UserRole.Auditor),
    __param(0, Param('caseId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TransactionCasesController.prototype, "getCase", null);
__decorate([
    Post(),
    HttpCode(200),
    Roles(UserRole.Admin, UserRole.ComplianceOfficer),
    __param(0, Body()),
    __param(1, Req()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ScreenTransactionDto, Object]),
    __metadata("design:returntype", void 0)
], TransactionCasesController.prototype, "screenTransaction", null);
__decorate([
    Post(':caseId/review'),
    Roles(UserRole.Admin, UserRole.ComplianceOfficer),
    __param(0, Param('caseId')),
    __param(1, Body()),
    __param(2, Req()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, ReviewTransitionDto, Object]),
    __metadata("design:returntype", void 0)
], TransactionCasesController.prototype, "markUnderReview", null);
__decorate([
    Post(':caseId/approve'),
    Roles(UserRole.Admin, UserRole.ComplianceOfficer),
    __param(0, Param('caseId')),
    __param(1, Body()),
    __param(2, Req()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, DecisionTransitionDto, Object]),
    __metadata("design:returntype", void 0)
], TransactionCasesController.prototype, "approveCase", null);
__decorate([
    Post(':caseId/reject'),
    Roles(UserRole.Admin, UserRole.ComplianceOfficer),
    __param(0, Param('caseId')),
    __param(1, Body()),
    __param(2, Req()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, DecisionTransitionDto, Object]),
    __metadata("design:returntype", void 0)
], TransactionCasesController.prototype, "rejectCase", null);
__decorate([
    Post(':caseId/escalate'),
    Roles(UserRole.Admin, UserRole.ComplianceOfficer),
    __param(0, Param('caseId')),
    __param(1, Body()),
    __param(2, Req()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, DecisionTransitionDto, Object]),
    __metadata("design:returntype", void 0)
], TransactionCasesController.prototype, "escalateCase", null);
TransactionCasesController = __decorate([
    Controller('transaction-cases'),
    __param(0, Inject(TransactionCasesService)),
    __metadata("design:paramtypes", [TransactionCasesService])
], TransactionCasesController);
export { TransactionCasesController };
//# sourceMappingURL=transaction-cases.controller.js.map