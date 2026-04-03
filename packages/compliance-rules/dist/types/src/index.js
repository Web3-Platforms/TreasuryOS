export var Jurisdiction;
(function (Jurisdiction) {
    Jurisdiction["EU"] = "EU";
    Jurisdiction["US"] = "US";
    Jurisdiction["CH"] = "CH";
    Jurisdiction["UAE"] = "UAE";
    Jurisdiction["GLOBAL"] = "GLOBAL";
})(Jurisdiction || (Jurisdiction = {}));
export var KycStatus;
(function (KycStatus) {
    KycStatus["Pending"] = "Pending";
    KycStatus["Approved"] = "Approved";
    KycStatus["Rejected"] = "Rejected";
    KycStatus["UnderReview"] = "UnderReview";
    KycStatus["Expired"] = "Expired";
})(KycStatus || (KycStatus = {}));
export var RiskLevel;
(function (RiskLevel) {
    RiskLevel["Low"] = "low";
    RiskLevel["Medium"] = "medium";
    RiskLevel["High"] = "high";
    RiskLevel["Critical"] = "critical";
})(RiskLevel || (RiskLevel = {}));
export var UserRole;
(function (UserRole) {
    UserRole["Admin"] = "admin";
    UserRole["ComplianceOfficer"] = "compliance_officer";
    UserRole["Auditor"] = "auditor";
})(UserRole || (UserRole = {}));
export var EntityStatus;
(function (EntityStatus) {
    EntityStatus["Draft"] = "draft";
    EntityStatus["Submitted"] = "submitted";
    EntityStatus["KycPending"] = "kyc_pending";
    EntityStatus["UnderReview"] = "under_review";
    EntityStatus["Approved"] = "approved";
    EntityStatus["Rejected"] = "rejected";
})(EntityStatus || (EntityStatus = {}));
export var WalletStatus;
(function (WalletStatus) {
    WalletStatus["Submitted"] = "submitted";
    WalletStatus["UnderReview"] = "under_review";
    WalletStatus["Approved"] = "approved";
    WalletStatus["ProposalPending"] = "proposal_pending";
    WalletStatus["Rejected"] = "rejected";
    WalletStatus["Synced"] = "synced";
    WalletStatus["SyncFailed"] = "sync_failed";
})(WalletStatus || (WalletStatus = {}));
export var ChainSyncStatus;
(function (ChainSyncStatus) {
    ChainSyncStatus["Pending"] = "pending";
    ChainSyncStatus["ProposalPending"] = "proposal_pending";
    ChainSyncStatus["Sent"] = "sent";
    ChainSyncStatus["Skipped"] = "skipped";
    ChainSyncStatus["Failed"] = "failed";
})(ChainSyncStatus || (ChainSyncStatus = {}));
export var TransactionCaseStatus;
(function (TransactionCaseStatus) {
    TransactionCaseStatus["Open"] = "open";
    TransactionCaseStatus["UnderReview"] = "under_review";
    TransactionCaseStatus["Approved"] = "approved";
    TransactionCaseStatus["Rejected"] = "rejected";
    TransactionCaseStatus["Escalated"] = "escalated";
})(TransactionCaseStatus || (TransactionCaseStatus = {}));
export var ReportJobStatus;
(function (ReportJobStatus) {
    ReportJobStatus["Queued"] = "queued";
    ReportJobStatus["Generated"] = "generated";
    ReportJobStatus["Failed"] = "failed";
})(ReportJobStatus || (ReportJobStatus = {}));
export var UserStatus;
(function (UserStatus) {
    UserStatus["Active"] = "active";
    UserStatus["Disabled"] = "disabled";
})(UserStatus || (UserStatus = {}));
export const entityWorkflowStates = [
    EntityStatus.Draft,
    EntityStatus.Submitted,
    EntityStatus.KycPending,
    EntityStatus.UnderReview,
    EntityStatus.Approved,
    EntityStatus.Rejected,
];
export const walletWorkflowStates = [
    WalletStatus.Submitted,
    WalletStatus.UnderReview,
    WalletStatus.Approved,
    WalletStatus.ProposalPending,
    WalletStatus.Rejected,
    WalletStatus.Synced,
    WalletStatus.SyncFailed,
];
export const transactionCaseWorkflowStates = [
    TransactionCaseStatus.Open,
    TransactionCaseStatus.UnderReview,
    TransactionCaseStatus.Approved,
    TransactionCaseStatus.Rejected,
    TransactionCaseStatus.Escalated,
];
export const reportWorkflowStates = [
    ReportJobStatus.Queued,
    ReportJobStatus.Generated,
    ReportJobStatus.Failed,
];
export const pilotRolePermissions = {
    [UserRole.Admin]: [
        'users.manage',
        'sessions.manage',
        'entities.manage',
        'wallets.manage',
        'cases.manage',
        'reports.generate',
        'audit.view',
        'system.configure',
    ],
    [UserRole.ComplianceOfficer]: [
        'entities.review',
        'wallets.review',
        'cases.review',
        'reports.generate',
        'audit.view',
    ],
    [UserRole.Auditor]: [
        'audit.view',
        'reports.view',
    ],
};
//# sourceMappingURL=index.js.map