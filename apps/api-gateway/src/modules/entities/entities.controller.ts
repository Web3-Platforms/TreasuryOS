import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import { UserRole } from '@treasuryos/types';

import type { ApiRequest } from '../../common/http-request.js';
import { extractActor } from '../../common/http-request.js';
import { Roles } from '../auth/roles.decorator.js';
import { EntitiesService } from './entities.service.js';
import { CreateEntityDto } from './dto/create-entity.dto.js';
import { UpdateDraftDto } from './dto/update-draft.dto.js';
import { EntityDecisionDto } from './dto/entity-decision.dto.js';

@Controller('entities')
export class EntitiesController {
  constructor(@Inject(EntitiesService) private readonly entitiesService: EntitiesService) {}

  @Get()
  @Roles(UserRole.Admin, UserRole.ComplianceOfficer, UserRole.Auditor)
  async listEntities() {
    return {
      entities: await this.entitiesService.listEntities(),
    };
  }

  @Get(':entityId')
  @Roles(UserRole.Admin, UserRole.ComplianceOfficer, UserRole.Auditor)
  getEntity(@Param('entityId') entityId: string) {
    return this.entitiesService.getEntity(entityId);
  }

  @Post()
  @Roles(UserRole.Admin, UserRole.ComplianceOfficer)
  createEntity(@Body() body: CreateEntityDto, @Req() request: ApiRequest) {
    return this.entitiesService.createEntity(body, extractActor(request));
  }

  @Patch(':entityId')
  @Roles(UserRole.Admin, UserRole.ComplianceOfficer)
  updateDraft(@Param('entityId') entityId: string, @Body() body: UpdateDraftDto, @Req() request: ApiRequest) {
    return this.entitiesService.updateDraft(entityId, body, extractActor(request));
  }

  @Post(':entityId/submit')
  @Roles(UserRole.Admin, UserRole.ComplianceOfficer)
  submitEntity(@Param('entityId') entityId: string, @Req() request: ApiRequest) {
    return this.entitiesService.submitEntity(entityId, extractActor(request));
  }

  @Post(':entityId/approve')
  @Roles(UserRole.Admin, UserRole.ComplianceOfficer)
  approveEntity(@Param('entityId') entityId: string, @Body() body: EntityDecisionDto, @Req() request: ApiRequest) {
    return this.entitiesService.approveEntity(entityId, body, extractActor(request));
  }

  @Post(':entityId/reject')
  @Roles(UserRole.Admin, UserRole.ComplianceOfficer)
  rejectEntity(@Param('entityId') entityId: string, @Body() body: EntityDecisionDto, @Req() request: ApiRequest) {
    return this.entitiesService.rejectEntity(entityId, body, extractActor(request));
  }
}
