import { TransactionCaseStatus } from '@treasuryos/types';
export declare class ListCasesQueryDto {
    entityId?: string;
    limit: number;
    status?: TransactionCaseStatus;
}
