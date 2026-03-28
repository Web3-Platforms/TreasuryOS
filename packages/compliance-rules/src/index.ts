import {
  EntityStatus,
  Jurisdiction,
  ProviderSelectionInput,
  RiskLevel,
  TransactionCaseStatus,
  pilotRolePermissions,
  UserRole,
  WalletStatus,
  type KycProvider,
} from '@treasuryos/types';

export function selectKycProvider(input: ProviderSelectionInput): KycProvider {
  if (input.enterprise && input.requiresFallback) {
    return 'sumsub-with-jumio-fallback';
  }

  if (input.jurisdiction === Jurisdiction.EU || input.jurisdiction === Jurisdiction.CH) {
    return 'sumsub';
  }

  return 'jumio';
}

export function requiresTravelRule(transaction: { amount: string }): boolean {
  const amount = Number(transaction.amount);
  return Number.isFinite(amount) && amount >= 1000;
}

export function requiresManualReview(transaction: {
  manualReviewRequested?: boolean;
  riskLevel: RiskLevel;
}): boolean {
  return (
    transaction.manualReviewRequested === true ||
    transaction.riskLevel === RiskLevel.High ||
    transaction.riskLevel === RiskLevel.Critical
  );
}

export function canSubmitEntity(status: EntityStatus): boolean {
  return status === EntityStatus.Draft;
}

export function canReviewEntity(status: EntityStatus): boolean {
  return status === EntityStatus.Submitted || status === EntityStatus.KycPending || status === EntityStatus.UnderReview;
}

export function canApproveEntity(status: EntityStatus): boolean {
  return status === EntityStatus.UnderReview;
}

export function canRequestWallet(entityStatus: EntityStatus): boolean {
  return entityStatus === EntityStatus.Approved;
}

export function canReviewWallet(status: WalletStatus): boolean {
  return status === WalletStatus.Submitted || status === WalletStatus.UnderReview;
}

export function canApproveWallet(status: WalletStatus): boolean {
  return status === WalletStatus.Submitted || status === WalletStatus.UnderReview;
}

export function canStartTransactionCaseReview(status: TransactionCaseStatus): boolean {
  return status === TransactionCaseStatus.Open || status === TransactionCaseStatus.Escalated;
}

export function canResolveTransactionCase(status: TransactionCaseStatus): boolean {
  return (
    status === TransactionCaseStatus.Open ||
    status === TransactionCaseStatus.UnderReview ||
    status === TransactionCaseStatus.Escalated
  );
}

export function canEscalateTransactionCase(status: TransactionCaseStatus): boolean {
  return status === TransactionCaseStatus.Open || status === TransactionCaseStatus.UnderReview;
}

export function hasPilotPermission(roles: UserRole[], permission: string): boolean {
  return roles.some((role) => pilotRolePermissions[role]?.includes(permission));
}

export function deriveTransactionRules(transaction: {
  amount: string;
  manualReviewRequested?: boolean;
  riskLevel: RiskLevel;
}): string[] {
  const rules: string[] = [];

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
