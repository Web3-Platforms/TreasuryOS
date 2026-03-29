import {
  Body,
  Controller,
  Get,
  HttpCode,
  Inject,
  Param,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { UserRole } from '@treasuryos/types';

import type { ApiRequest } from '../../common/http-request.js';
import { extractActor } from '../../common/http-request.js';
import { Roles } from '../auth/roles.decorator.js';
import { TransactionCasesService } from './transaction-cases.service.js';
import { ScreenTransactionDto } from './dto/screen-transaction.dto.js';
import { DecisionTransitionDto } from './dto/decision-transition.dto.js';
import { ListCasesQueryDto } from './dto/list-cases-query.dto.js';
import { ReviewTransitionDto } from './dto/review-transition.dto.js';

@Controller('transaction-cases')
export class TransactionCasesController {
  constructor(
    @Inject(TransactionCasesService)
    private readonly transactionCasesService: TransactionCasesService,
  ) {}

  @Get()
  @Roles(UserRole.Admin, UserRole.ComplianceOfficer, UserRole.Auditor)
  async listCases(@Query() query: ListCasesQueryDto) {
    return {
      cases: await this.transactionCasesService.listCases(query),
    };
  }

  @Get(':caseId')
  @Roles(UserRole.Admin, UserRole.ComplianceOfficer, UserRole.Auditor)
  getCase(@Param('caseId') caseId: string) {
    return this.transactionCasesService.getCase(caseId);
  }

  @Post()
  @HttpCode(200)
  @Roles(UserRole.Admin, UserRole.ComplianceOfficer)
  screenTransaction(@Body() body: ScreenTransactionDto, @Req() request: ApiRequest) {
    return this.transactionCasesService.screenTransaction(body, extractActor(request));
  }

  @Post(':caseId/review')
  @Roles(UserRole.Admin, UserRole.ComplianceOfficer)
  markUnderReview(@Param('caseId') caseId: string, @Body() body: ReviewTransitionDto, @Req() request: ApiRequest) {
    return this.transactionCasesService.markUnderReview(caseId, body, extractActor(request));
  }

  @Post(':caseId/approve')
  @Roles(UserRole.Admin, UserRole.ComplianceOfficer)
  approveCase(@Param('caseId') caseId: string, @Body() body: DecisionTransitionDto, @Req() request: ApiRequest) {
    return this.transactionCasesService.approveCase(caseId, body, extractActor(request));
  }

  @Post(':caseId/reject')
  @Roles(UserRole.Admin, UserRole.ComplianceOfficer)
  rejectCase(@Param('caseId') caseId: string, @Body() body: DecisionTransitionDto, @Req() request: ApiRequest) {
    return this.transactionCasesService.rejectCase(caseId, body, extractActor(request));
  }

  @Post(':caseId/escalate')
  @Roles(UserRole.Admin, UserRole.ComplianceOfficer)
  escalateCase(@Param('caseId') caseId: string, @Body() body: DecisionTransitionDto, @Req() request: ApiRequest) {
    return this.transactionCasesService.escalateCase(caseId, body, extractActor(request));
  }
}
