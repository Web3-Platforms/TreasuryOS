import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { UserRole } from '@treasuryos/types';
import type { Response } from 'express';

import type { ApiRequest } from '../../common/http-request.js';
import { extractActor } from '../../common/http-request.js';
import { Roles } from '../auth/roles.decorator.js';
import { ReportsService } from './reports.service.js';

@Controller('reports')
export class ReportsController {
  constructor(@Inject(ReportsService) private readonly reportsService: ReportsService) {}

  @Get()
  @Roles(UserRole.Admin, UserRole.ComplianceOfficer, UserRole.Auditor)
  async listReports(@Query() query: unknown) {
    return {
      reports: await this.reportsService.listReports(query),
    };
  }

  @Get(':reportId')
  @Roles(UserRole.Admin, UserRole.ComplianceOfficer, UserRole.Auditor)
  getReport(@Param('reportId') reportId: string) {
    return this.reportsService.getReport(reportId);
  }

  @Post()
  @Roles(UserRole.Admin, UserRole.ComplianceOfficer, UserRole.Auditor)
  generateMonthlyReport(@Body() body: unknown, @Req() request: ApiRequest) {
    return this.reportsService.generateMonthlyReport(body, extractActor(request));
  }

  @Get(':reportId/download')
  @Roles(UserRole.Admin, UserRole.ComplianceOfficer, UserRole.Auditor)
  @Throttle({ reports: { ttl: 60000, limit: 20 } })
  async downloadReport(@Param('reportId') reportId: string, @Res() response: Response) {
    const artifact = await this.reportsService.getReportArtifact(reportId);
    response.setHeader('content-type', artifact.mimeType);
    response.setHeader('content-disposition', `attachment; filename="${artifact.downloadName}"`);
    response.send(artifact.contents);
  }
}
