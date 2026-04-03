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
import { Body, Controller, Get, Inject, Param, Patch, Post, Req, } from '@nestjs/common';
import { UserRole } from '@treasuryos/types';
import { extractActor } from '../../common/http-request.js';
import { Roles } from '../auth/roles.decorator.js';
import { EntitiesService } from './entities.service.js';
import { CreateEntityDto } from './dto/create-entity.dto.js';
import { UpdateDraftDto } from './dto/update-draft.dto.js';
import { EntityDecisionDto } from './dto/entity-decision.dto.js';
let EntitiesController = class EntitiesController {
    entitiesService;
    constructor(entitiesService) {
        this.entitiesService = entitiesService;
    }
    async listEntities() {
        return {
            entities: await this.entitiesService.listEntities(),
        };
    }
    getEntity(entityId) {
        return this.entitiesService.getEntity(entityId);
    }
    createEntity(body, request) {
        return this.entitiesService.createEntity(body, extractActor(request));
    }
    updateEntity(entityId, body, request) {
        return this.entitiesService.updateEntity(entityId, body, extractActor(request));
    }
    submitEntity(entityId, request) {
        return this.entitiesService.submitEntity(entityId, extractActor(request));
    }
    approveEntity(entityId, body, request) {
        return this.entitiesService.approveEntity(entityId, body, extractActor(request));
    }
    rejectEntity(entityId, body, request) {
        return this.entitiesService.rejectEntity(entityId, body, extractActor(request));
    }
};
__decorate([
    Get(),
    Roles(UserRole.Admin, UserRole.ComplianceOfficer, UserRole.Auditor),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], EntitiesController.prototype, "listEntities", null);
__decorate([
    Get(':entityId'),
    Roles(UserRole.Admin, UserRole.ComplianceOfficer, UserRole.Auditor),
    __param(0, Param('entityId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], EntitiesController.prototype, "getEntity", null);
__decorate([
    Post(),
    Roles(UserRole.Admin, UserRole.ComplianceOfficer),
    __param(0, Body()),
    __param(1, Req()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CreateEntityDto, Object]),
    __metadata("design:returntype", void 0)
], EntitiesController.prototype, "createEntity", null);
__decorate([
    Patch(':entityId'),
    Roles(UserRole.Admin, UserRole.ComplianceOfficer),
    __param(0, Param('entityId')),
    __param(1, Body()),
    __param(2, Req()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, UpdateDraftDto, Object]),
    __metadata("design:returntype", void 0)
], EntitiesController.prototype, "updateEntity", null);
__decorate([
    Post(':entityId/submit'),
    Roles(UserRole.Admin, UserRole.ComplianceOfficer),
    __param(0, Param('entityId')),
    __param(1, Req()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], EntitiesController.prototype, "submitEntity", null);
__decorate([
    Post(':entityId/approve'),
    Roles(UserRole.Admin, UserRole.ComplianceOfficer),
    __param(0, Param('entityId')),
    __param(1, Body()),
    __param(2, Req()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, EntityDecisionDto, Object]),
    __metadata("design:returntype", void 0)
], EntitiesController.prototype, "approveEntity", null);
__decorate([
    Post(':entityId/reject'),
    Roles(UserRole.Admin, UserRole.ComplianceOfficer),
    __param(0, Param('entityId')),
    __param(1, Body()),
    __param(2, Req()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, EntityDecisionDto, Object]),
    __metadata("design:returntype", void 0)
], EntitiesController.prototype, "rejectEntity", null);
EntitiesController = __decorate([
    Controller('entities'),
    __param(0, Inject(EntitiesService)),
    __metadata("design:paramtypes", [EntitiesService])
], EntitiesController);
export { EntitiesController };
//# sourceMappingURL=entities.controller.js.map