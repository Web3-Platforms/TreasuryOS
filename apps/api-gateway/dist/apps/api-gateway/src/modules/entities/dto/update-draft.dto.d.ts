import { Jurisdiction, RiskLevel } from '@treasuryos/types';
export declare class UpdateDraftDto {
    jurisdiction?: Jurisdiction;
    legalName?: string;
    notes?: string;
    riskLevel?: RiskLevel;
}
