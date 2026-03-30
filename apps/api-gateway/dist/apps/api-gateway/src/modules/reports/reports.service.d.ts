import { type AuthenticatedUser, type ReportRecord } from '@treasuryos/types';
import { AuditService } from '../audit/audit.service.js';
import { DatabaseService } from '../database/database.service.js';
import { ReportsRepository } from './reports.repository.js';
import { RedisQueueService } from '../platform/redis-queue.service.js';
type ReportArtifact = {
    contents: Buffer;
    downloadName: string;
    mimeType: string;
};
export declare class ReportsService {
    private readonly reportsRepository;
    private readonly database;
    private readonly auditService;
    private readonly queueService;
    private readonly env;
    constructor(reportsRepository: ReportsRepository, database: DatabaseService, auditService: AuditService, queueService: RedisQueueService);
    listReports(query: unknown): Promise<ReportRecord[]>;
    getReport(reportId: string): Promise<ReportRecord>;
    generateMonthlyReport(input: unknown, actor: AuthenticatedUser): Promise<ReportRecord>;
    getReportArtifact(reportId: string): Promise<ReportArtifact>;
    private buildMonthlyReport;
    private writeReportArtifact;
    private getReportsDirPath;
    private resolveArtifactPath;
    private requireReport;
    private requireReportFromStore;
}
export {};
