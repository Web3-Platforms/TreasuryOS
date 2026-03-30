import { EntityStatus, ProviderSelectionInput, RiskLevel, TransactionCaseStatus, UserRole, WalletStatus, type KycProvider } from '@treasuryos/types';
export declare function selectKycProvider(input: ProviderSelectionInput): KycProvider;
export declare function requiresTravelRule(transaction: {
    amount: string;
}): boolean;
export declare function requiresManualReview(transaction: {
    manualReviewRequested?: boolean;
    riskLevel: RiskLevel;
}): boolean;
export declare function canSubmitEntity(status: EntityStatus): boolean;
export declare function canReviewEntity(status: EntityStatus): boolean;
export declare function canApproveEntity(status: EntityStatus): boolean;
export declare function canRequestWallet(entityStatus: EntityStatus): boolean;
export declare function canReviewWallet(status: WalletStatus): boolean;
export declare function canApproveWallet(status: WalletStatus): boolean;
export declare function canStartTransactionCaseReview(status: TransactionCaseStatus): boolean;
export declare function canResolveTransactionCase(status: TransactionCaseStatus): boolean;
export declare function canEscalateTransactionCase(status: TransactionCaseStatus): boolean;
export declare function hasPilotPermission(roles: UserRole[], permission: string): boolean;
export declare function deriveTransactionRules(transaction: {
    amount: string;
    manualReviewRequested?: boolean;
    riskLevel: RiskLevel;
}): string[];
