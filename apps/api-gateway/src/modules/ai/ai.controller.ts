import { Body, Controller, Get, Inject, Param, Post, Req } from '@nestjs/common';
import { UserRole } from '@treasuryos/types';

import { extractActor, type ApiRequest } from '../../common/http-request.js';
import { Roles } from '../auth/roles.decorator.js';
import { SubmitAiFeedbackDto } from './dto/submit-ai-feedback.dto.js';
import { AiService } from './ai.service.js';

@Controller('ai')
export class AiController {
  constructor(@Inject(AiService) private readonly aiService: AiService) {}

  @Get('transaction-cases/:caseId/advisory')
  @Roles(UserRole.Admin, UserRole.ComplianceOfficer, UserRole.Auditor)
  getTransactionCaseAdvisory(@Param('caseId') caseId: string) {
    return this.aiService.getTransactionCaseAdvisory(caseId);
  }

  @Post('transaction-cases/:caseId/advisory')
  @Roles(UserRole.Admin, UserRole.ComplianceOfficer, UserRole.Auditor)
  generateTransactionCaseAdvisory(@Param('caseId') caseId: string, @Req() request: ApiRequest) {
    return this.aiService.generateTransactionCaseAdvisory(caseId, extractActor(request));
  }

  @Post('advisories/:advisoryId/feedback')
  @Roles(UserRole.Admin, UserRole.ComplianceOfficer, UserRole.Auditor)
  submitAdvisoryFeedback(
    @Param('advisoryId') advisoryId: string,
    @Body() body: SubmitAiFeedbackDto,
    @Req() request: ApiRequest,
  ) {
    return this.aiService.submitAdvisoryFeedback(advisoryId, body, extractActor(request));
  }
}
