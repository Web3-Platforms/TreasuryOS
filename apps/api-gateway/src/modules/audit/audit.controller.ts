import { Controller, Get, Inject, Query } from '@nestjs/common';
import { UserRole } from '@treasuryos/types';
import { z } from 'zod';

import { Roles } from '../auth/roles.decorator.js';
import { AuditService } from './audit.service.js';

const querySchema = z.object({
  limit: z.coerce.number().int().min(1).max(250).default(50),
});

@Controller('audit')
export class AuditController {
  constructor(@Inject(AuditService) private readonly auditService: AuditService) {}

  @Get('events')
  @Roles(UserRole.Admin, UserRole.ComplianceOfficer, UserRole.Auditor)
  async listEvents(@Query() query: unknown) {
    const { limit } = querySchema.parse(query);

    return {
      events: await this.auditService.listRecent(limit),
      limit,
    };
  }
}
