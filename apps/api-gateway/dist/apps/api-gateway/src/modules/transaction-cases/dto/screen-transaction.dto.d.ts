import { Jurisdiction } from '@treasuryos/types';
export declare class ScreenTransactionDto {
    amount: number;
    asset: string;
    destinationWallet: string;
    entityId: string;
    jurisdiction?: Jurisdiction;
    manualReviewRequested: boolean;
    notes?: string;
    referenceId?: string;
    sourceWallet: string;
    walletId?: string;
}
