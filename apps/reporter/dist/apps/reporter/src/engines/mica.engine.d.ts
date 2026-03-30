import { Jurisdiction } from '@treasuryos/types';
export declare class MicaEngine {
    generateMonthlyReport(month: string, institutionId: string): Promise<{
        reportingPeriod: string;
        institutionId: string;
        jurisdiction: Jurisdiction;
        assetBreakdown: never[];
        suspiciousActivities: never[];
        generatedAt: string;
        format: string;
    }>;
}
