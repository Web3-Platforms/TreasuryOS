import { Controller, Get, Inject, Param } from '@nestjs/common';
import { UserRole } from '@treasuryos/types';

import { Roles } from '../auth/roles.decorator.js';
import { AiService } from './ai.service.js';

@Controller('ai')
export class AiController {
  constructor(@Inject(AiService) private readonly aiService: AiService) {}

  @Get('transaction-cases/:caseId/advisory')
  @Roles(UserRole.Admin, UserRole.ComplianceOfficer, UserRole.Auditor)
  getTransactionCaseAdvisory(@Param('caseId') caseId: string) {
    return this.aiService.getTransactionCaseAdvisory(caseId);
  }
}
