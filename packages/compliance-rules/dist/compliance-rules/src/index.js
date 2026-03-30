import { EntityStatus, Jurisdiction, RiskLevel, TransactionCaseStatus, pilotRolePermissions, WalletStatus, } from '@treasuryos/types';
export function selectKycProvider(input) {
    if (input.enterprise && input.requiresFallback) {
        return 'sumsub-with-jumio-fallback';
    }
    if (input.jurisdiction === Jurisdiction.EU || input.jurisdiction === Jurisdiction.CH) {
        return 'sumsub';
    }
    return 'jumio';
}
export function requiresTravelRule(transaction) {
    const amount = Number(transaction.amount);
    return Number.isFinite(amount) && amount >= 1000;
}
export function requiresManualReview(transaction) {
    return (transaction.manualReviewRequested === true ||
        transaction.riskLevel === RiskLevel.High ||
        transaction.riskLevel === RiskLevel.Critical);
}
export function canSubmitEntity(status) {
    return status === EntityStatus.Draft;
}
export function canReviewEntity(status) {
    return status === EntityStatus.Submitted || status === EntityStatus.KycPending || status === EntityStatus.UnderReview;
}
export function canApproveEntity(status) {
    return status === EntityStatus.UnderReview;
}
export function canRequestWallet(entityStatus) {
    return entityStatus === EntityStatus.Approved;
}
export function canReviewWallet(status) {
    return status === WalletStatus.Submitted || status === WalletStatus.UnderReview;
}
export function canApproveWallet(status) {
    return status === WalletStatus.Submitted || status === WalletStatus.UnderReview;
}
export function canStartTransactionCaseReview(status) {
    return status === TransactionCaseStatus.Open || status === TransactionCaseStatus.Escalated;
}
export function canResolveTransactionCase(status) {
    return (status === TransactionCaseStatus.Open ||
        status === TransactionCaseStatus.UnderReview ||
        status === TransactionCaseStatus.Escalated);
}
export function canEscalateTransactionCase(status) {
    return status === TransactionCaseStatus.Open || status === TransactionCaseStatus.UnderReview;
}
export function hasPilotPermission(roles, permission) {
    return roles.some((role) => pilotRolePermissions[role]?.includes(permission));
}
export function deriveTransactionRules(transaction) {
    const rules = [];
    if (requiresTravelRule(transaction)) {
        rules.push('amount_threshold');
    }
    if (transaction.riskLevel === RiskLevel.High || transaction.riskLevel === RiskLevel.Critical) {
        rules.push('high_risk_entity');
    }
    if (transaction.manualReviewRequested) {
        rules.push('manual_review_requested');
    }
    return rules;
}
//# sourceMappingURL=index.js.map