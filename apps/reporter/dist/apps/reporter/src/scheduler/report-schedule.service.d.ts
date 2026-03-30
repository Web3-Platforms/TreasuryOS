import { MicaEngine } from '../engines/mica.engine.js';
export declare class ReportScheduleService {
    private readonly micaEngine;
    private readonly logger;
    constructor(micaEngine: MicaEngine);
    previewMonthlyMicaRun(month: string, institutionId: string): Promise<{
        reportingPeriod: string;
        institutionId: string;
        jurisdiction: import("@treasuryos/types").Jurisdiction;
        assetBreakdown: never[];
        suspiciousActivities: never[];
        generatedAt: string;
        format: string;
    }>;
}
