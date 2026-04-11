import fs from 'node:fs';
import path from 'node:path';

import {
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import {
  ReportJobStatus,
  TransactionCaseStatus,
  WalletStatus,
  type AuthenticatedUser,
  type ReportRecord,
} from '@treasuryos/types';
import { z } from 'zod';

import { createResourceId } from '../../common/ids.js';
import { AuditService } from '../audit/audit.service.js';
import { DatabaseService } from '../database/database.service.js';
import { ReportsRepository } from './reports.repository.js';
import { RedisQueueService } from '../platform/redis-queue.service.js';
import { loadApiGatewayEnv } from '../../config/env.js';

const monthSchema = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Month must use YYYY-MM');

const generateReportSchema = z.object({
  month: monthSchema,
});

const listReportsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(250).default(50),
  month: monthSchema.optional(),
});

type ReportArtifact = {
  contents: Buffer;
  downloadName: string;
  mimeType: string;
};

type MonthWindow = {
  endExclusive: Date;
  start: Date;
};

function getMonthWindow(month: string): MonthWindow {
  const [year, monthNumber] = month.split('-').map(Number);
  return {
    endExclusive: new Date(Date.UTC(year, monthNumber, 1, 0, 0, 0, 0)),
    start: new Date(Date.UTC(year, monthNumber - 1, 1, 0, 0, 0, 0)),
  };
}

function isWithinMonth(value: string | undefined, monthWindow: MonthWindow) {
  if (!value) {
    return false;
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return false;
  }

  return parsed >= monthWindow.start && parsed < monthWindow.endExclusive;
}

function escapeCsv(value: string) {
  if (value.includes(',') || value.includes('\n') || value.includes('"')) {
    return `"${value.replaceAll('"', '""')}"`;
  }

  return value;
}

function serializeCsv(rows: string[][]) {
  return `${rows.map((row) => row.map((cell) => escapeCsv(cell)).join(',')).join('\n')}\n`;
}

@Injectable()
export class ReportsService {
  private readonly env = loadApiGatewayEnv();

  constructor(
    @Inject(ReportsRepository)
    private readonly reportsRepository: ReportsRepository,
    @Inject(DatabaseService)
    private readonly database: DatabaseService,
    @Inject(AuditService)
    private readonly auditService: AuditService,
    @Inject(RedisQueueService)
    private readonly queueService: RedisQueueService,
  ) {}

  async listReports(query: unknown) {
    const filters = listReportsQuerySchema.parse(query);
    const reports = await this.reportsRepository.listAll();

    return reports
      .filter((record) => !filters.month || record.month === filters.month)
      .slice(0, filters.limit);
  }

  async getReport(reportId: string) {
    return this.requireReport(reportId);
  }

  async generateMonthlyReport(input: unknown, actor: AuthenticatedUser) {
    const { month } = generateReportSchema.parse(input);
    const reports = await this.reportsRepository.listAll();
    const existingReport = reports.find(
      (record) =>
        record.month === month &&
        record.status === ReportJobStatus.Generated &&
        !!record.artifactPath &&
        fs.existsSync(this.resolveArtifactPath(record.artifactPath)),
    );

    if (existingReport) {
      return existingReport;
    }

    const now = new Date().toISOString();
    const queuedReport: ReportRecord = {
      id: createResourceId('report'),
      month,
      status: ReportJobStatus.Queued,
      generatedBy: actor.id,
      createdAt: now,
      metrics: {
        entityCount: 0,
        approvedWalletCount: 0,
        totalCaseCount: 0,
        openCaseCount: 0,
        approvedCaseCount: 0,
        rejectedCaseCount: 0,
        escalatedCaseCount: 0,
      },
    };

    await this.reportsRepository.save(queuedReport);

    try {
      const builtReport = await this.buildMonthlyReport(month);
      const downloadName = `mica-operations-${month}.csv`;
      const artifactPath = this.writeReportArtifact(queuedReport.id, month, builtReport.csv);
      const generatedAt = new Date().toISOString();

      const generatedReport = await this.database.withTransaction(async (client) => {
        const record = await this.requireReportFromStore(queuedReport.id, client);
        record.status = ReportJobStatus.Generated;
        record.generatedAt = generatedAt;
        record.artifactPath = artifactPath;
        record.artifactMimeType = 'text/csv; charset=utf-8';
        record.downloadName = downloadName;
        record.rowCount = builtReport.rowCount;
        record.metrics = builtReport.metrics;
        await this.reportsRepository.save(record, client);
        return record;
      });

      await this.auditService.record({
        action: 'report.generated',
        actor,
        resourceType: 'report',
        resourceId: generatedReport.id,
        summary: `Generated monthly MiCA operations report for ${month}`,
        metadata: {
          artifactPath: generatedReport.artifactPath ?? null,
          month,
          rowCount: generatedReport.rowCount ?? 0,
        },
      });
      await this.queueService.enqueue(`${this.env.REDIS_QUEUE_NAME}:reports`, {
        month,
        reportId: generatedReport.id,
        rowCount: generatedReport.rowCount ?? 0,
        type: 'report.generated',
      });

      return generatedReport;
    } catch (error) {
      await this.database.withTransaction(async (client) => {
        const record = await this.requireReportFromStore(queuedReport.id, client);
        record.status = ReportJobStatus.Failed;
        await this.reportsRepository.save(record, client);
      });

      await this.auditService.record({
        action: 'report.failed',
        actor,
        resourceType: 'report',
        resourceId: queuedReport.id,
        summary: `Monthly MiCA operations report for ${month} failed`,
        metadata: {
          error: error instanceof Error ? error.message : String(error),
        },
      });

      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Report generation failed',
      );
    }
  }

  async getReportArtifact(reportId: string): Promise<ReportArtifact> {
    const report = await this.requireReport(reportId);

    if (report.status !== ReportJobStatus.Generated || !report.artifactPath) {
      throw new ConflictException(`Report ${reportId} is not ready for download`);
    }

    const resolvedPath = this.resolveArtifactPath(report.artifactPath);

    if (!fs.existsSync(resolvedPath)) {
      throw new NotFoundException(`Report artifact for ${reportId} not found`);
    }

    return {
      contents: fs.readFileSync(resolvedPath),
      downloadName: report.downloadName ?? `mica-operations-${report.month}.csv`,
      mimeType: report.artifactMimeType ?? 'text/csv; charset=utf-8',
    };
  }

  private async buildMonthlyReport(month: string) {
    const window = getMonthWindow(month);
    const startIso = window.start.toISOString();
    const endIso = window.endExclusive.toISOString();

    const entitiesResult = await this.database.pool.query(
      'SELECT id FROM entities WHERE created_at >= $1 AND created_at < $2',
      [startIso, endIso]
    );

    const walletsResult = await this.database.pool.query(
      'SELECT id FROM wallets WHERE COALESCE(reviewed_at, updated_at) >= $1 AND COALESCE(reviewed_at, updated_at) < $2 AND status IN ($3, $4, $5)',
      [startIso, endIso, WalletStatus.Approved, WalletStatus.ProposalPending, WalletStatus.Synced]
    );

    const casesResult = await this.database.pool.query(
      'SELECT id, case_status, triggered_rules, amount, asset, source_wallet, destination_wallet FROM transaction_cases WHERE created_at >= $1 AND created_at < $2',
      [startIso, endIso]
    );

    const monthlyEntities = entitiesResult.rows;
    const monthlyApprovedWallets = walletsResult.rows;
    const monthlyCases = casesResult.rows.map(row => ({
      id: String(row.id),
      caseStatus: row.case_status,
      triggeredRules: Array.isArray(row.triggered_rules) ? row.triggered_rules : [],
      amount: row.amount,
      asset: row.asset,
      sourceWallet: row.source_wallet,
      destinationWallet: row.destination_wallet
    }));

    const metrics = {
      entityCount: monthlyEntities.length,
      approvedWalletCount: monthlyApprovedWallets.length,
      totalCaseCount: monthlyCases.length,
      openCaseCount: monthlyCases.filter((record) =>
        [
          TransactionCaseStatus.Open,
          TransactionCaseStatus.UnderReview,
          TransactionCaseStatus.Escalated,
        ].includes(record.caseStatus),
      ).length,
      approvedCaseCount: monthlyCases.filter(
        (record) => record.caseStatus === TransactionCaseStatus.Approved,
      ).length,
      rejectedCaseCount: monthlyCases.filter(
        (record) => record.caseStatus === TransactionCaseStatus.Rejected,
      ).length,
      escalatedCaseCount: monthlyCases.filter(
        (record) => record.caseStatus === TransactionCaseStatus.Escalated,
      ).length,
    };

    const rows: string[][] = [
      ['section', 'reference', 'status', 'metric', 'value', 'details'],
      ['summary', '', '', 'report_month', month, ''],
      ['summary', '', '', 'institution_id', this.env.PILOT_INSTITUTION_ID, ''],
      ['summary', '', '', 'institution_name', this.env.PILOT_INSTITUTION_NAME, ''],
      ['summary', '', '', 'entity_count', String(metrics.entityCount), 'Entities created during the reporting month'],
      [
        'summary',
        '',
        '',
        'approved_wallet_count',
        String(metrics.approvedWalletCount),
        'Wallets approved, pending governance execution, or synced during the reporting month',
      ],
      ['summary', '', '', 'total_case_count', String(metrics.totalCaseCount), 'Transaction cases opened during the reporting month'],
      ['summary', '', '', 'open_case_count', String(metrics.openCaseCount), 'Cases still unresolved at export time'],
      ['summary', '', '', 'approved_case_count', String(metrics.approvedCaseCount), 'Cases approved by compliance'],
      ['summary', '', '', 'rejected_case_count', String(metrics.rejectedCaseCount), 'Cases rejected by compliance'],
      ['summary', '', '', 'escalated_case_count', String(metrics.escalatedCaseCount), 'Cases escalated for follow-up'],
    ];

    if (monthlyCases.length === 0) {
      rows.push(['case', '', '', 'none', '0', 'No transaction cases were opened during this reporting month']);
    } else {
      for (const transactionCase of monthlyCases) {
        rows.push([
          'case',
          transactionCase.id,
          transactionCase.caseStatus,
          'triggered_rules',
          transactionCase.triggeredRules.join('|') || 'none',
          `${transactionCase.asset} ${transactionCase.amount} ${transactionCase.sourceWallet} -> ${transactionCase.destinationWallet}`,
        ]);
      }
    }

    return {
      csv: serializeCsv(rows),
      metrics,
      rowCount: rows.length - 1,
    };
  }

  private writeReportArtifact(reportId: string, month: string, contents: string) {
    const relativePath = path.join(month, `mica-operations-${month}-${reportId}.csv`);
    const absolutePath = this.resolveArtifactPath(relativePath);
    fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
    fs.writeFileSync(absolutePath, contents, 'utf8');
    return relativePath;
  }

  private getReportsDirPath() {
    return this.env.PILOT_REPORTS_DIR;
  }

  private resolveArtifactPath(relativePath: string) {
    const reportsRoot = path.resolve(this.getReportsDirPath());
    const absolutePath = path.resolve(reportsRoot, relativePath);
    const relativeToRoot = path.relative(reportsRoot, absolutePath);

    if (relativeToRoot.startsWith('..') || path.isAbsolute(relativeToRoot)) {
      throw new NotFoundException('Report artifact path is invalid');
    }

    return absolutePath;
  }

  private async requireReport(reportId: string) {
    const report = await this.reportsRepository.findById(reportId);

    if (!report) {
      throw new NotFoundException(`Report ${reportId} not found`);
    }

    return report;
  }

  private async requireReportFromStore(reportId: string, client: any) {
    const report = await this.reportsRepository.findById(reportId, client);

    if (!report) {
      throw new NotFoundException(`Report ${reportId} not found`);
    }

    return report;
  }
}
