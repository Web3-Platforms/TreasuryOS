import type { Response } from 'express';
import type { ApiRequest } from '../../common/http-request.js';
import { ReportsService } from './reports.service.js';
export declare class ReportsController {
    private readonly reportsService;
    constructor(reportsService: ReportsService);
    listReports(query: unknown): Promise<{
        reports: import("@treasuryos/types").ReportRecord[];
    }>;
    getReport(reportId: string): Promise<import("@treasuryos/types").ReportRecord>;
    generateMonthlyReport(body: unknown, request: ApiRequest): Promise<import("@treasuryos/types").ReportRecord>;
    downloadReport(reportId: string, response: Response): Promise<void>;
}
