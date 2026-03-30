import { Jurisdiction, RiskLevel } from '@treasuryos/types';
export declare class CreateEntityDto {
    jurisdiction: Jurisdiction;
    legalName: string;
    notes?: string;
    riskLevel: RiskLevel;
}
