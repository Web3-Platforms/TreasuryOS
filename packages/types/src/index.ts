export enum Jurisdiction {
  EU = 'EU',
  US = 'US',
  CH = 'CH',
  UAE = 'UAE',
  GLOBAL = 'GLOBAL',
}

export enum KycStatus {
  Pending = 'Pending',
  Approved = 'Approved',
  Rejected = 'Rejected',
  UnderReview = 'UnderReview',
  Expired = 'Expired',
}

export enum RiskLevel {
  Low = 'low',
  Medium = 'medium',
  High = 'high',
  Critical = 'critical',
}

export enum UserRole {
  Admin = 'admin',
  ComplianceOfficer = 'compliance_officer',
  Auditor = 'auditor',
}

export enum EntityStatus {
  Draft = 'draft',
  Submitted = 'submitted',
  KycPending = 'kyc_pending',
  UnderReview = 'under_review',
  Approved = 'approved',
  Rejected = 'rejected',
}

export enum WalletStatus {
  Submitted = 'submitted',
  UnderReview = 'under_review',
  Approved = 'approved',
  ProposalPending = 'proposal_pending',
  Rejected = 'rejected',
  Synced = 'synced',
  SyncFailed = 'sync_failed',
}

export enum ChainSyncStatus {
  Pending = 'pending',
  ProposalPending = 'proposal_pending',
  Sent = 'sent',
  Skipped = 'skipped',
  Failed = 'failed',
}

export enum TransactionCaseStatus {
  Open = 'open',
  UnderReview = 'under_review',
  Approved = 'approved',
  Rejected = 'rejected',
  Escalated = 'escalated',
}

export enum ReportJobStatus {
  Queued = 'queued',
  Generated = 'generated',
  Failed = 'failed',
}

export enum UserStatus {
  Active = 'active',
  Disabled = 'disabled',
}

export interface EntityRecord {
  id: string;
  legalName: string;
  jurisdiction: Jurisdiction;
  status: EntityStatus;
  kycStatus: KycStatus;
  riskLevel: RiskLevel;
  provider: KycProvider;
  externalUserId: string;
  kycApplicantId?: string;
  kycLevelName?: string;
  kycCorrelationId?: string;
  latestKycWebhookType?: string;
  latestKycReviewAnswer?: 'GREEN' | 'RED';
  lastKycEventAt?: string;
  notes?: string;
  wallets: string[];
  createdBy: string;
  submittedAt?: string;
  reviewedAt?: string;
  lastUpdatedAt: string;
  createdAt: string;
}

export interface ProviderSelectionInput {
  jurisdiction: Jurisdiction;
  enterprise: boolean;
  requiresFallback: boolean;
}

export interface ReviewedTransaction {
  id: string;
  entityId: string;
  walletId?: string;
  transactionReference: string;
  caseStatus: TransactionCaseStatus;
  amount: string;
  asset: string;
  sourceWallet: string;
  destinationWallet: string;
  jurisdiction: Jurisdiction;
  riskLevel: RiskLevel;
  triggeredRules: string[];
  manualReviewRequested: boolean;
  notes?: string;
  reviewNotes?: string;
  evidenceRef?: string;
  createdBy: string;
  reviewedBy?: string;
  resolutionReason?: string;
  createdAt: string;
  updatedAt: string;
  reviewedAt?: string;
}

export type AiProviderKind = 'deterministic' | 'openai-compatible';

export type AiAdvisoryType = 'transaction_case_summary';

export type AiAdvisoryResourceType = 'transaction_case';

export interface AiAdvisoryRecord {
  id: string;
  advisoryType: AiAdvisoryType;
  resourceType: AiAdvisoryResourceType;
  resourceId: string;
  summary: string;
  recommendation?: string;
  riskFactors: string[];
  checklist: string[];
  confidence?: number;
  model: string;
  provider: AiProviderKind;
  promptVersion: string;
  fallbackUsed: boolean;
  providerLatencyMs?: number;
  redactionProfile: string;
  sourceHash: string;
  generatedAt: string;
  updatedAt: string;
}

export type AiAdvisoryFeedbackHelpfulness = 'helpful' | 'not_helpful';

export type AiAdvisoryFeedbackDisposition = 'accepted' | 'edited' | 'dismissed';

export interface AiAdvisoryFeedbackRecord {
  id: string;
  advisoryId: string;
  advisoryType: AiAdvisoryType;
  resourceType: AiAdvisoryResourceType;
  resourceId: string;
  actorId: string;
  actorEmail: string;
  helpfulness: AiAdvisoryFeedbackHelpfulness;
  disposition: AiAdvisoryFeedbackDisposition;
  note?: string;
  advisorySourceHash: string;
  advisoryProvider: AiProviderKind;
  advisoryModel: string;
  advisoryPromptVersion: string;
  createdAt: string;
  updatedAt: string;
}

export interface AiAdvisoryEnvelope {
  enabled: boolean;
  advisory: AiAdvisoryRecord | null;
  notice?: string;
  reason?: string;
}

export type KycProvider = 'sumsub' | 'jumio' | 'sumsub-with-jumio-fallback';

export interface AuthenticatedUser {
  id: string;
  email: string;
  roles: UserRole[];
}

export interface UserRecord {
  id: string;
  email: string;
  displayName: string;
  roles: UserRole[];
  status: UserStatus;
  passwordSalt: string;
  passwordHash: string;
  createdAt: string;
  lastLoginAt?: string;
}

export interface SessionRecord {
  id: string;
  userId: string;
  tokenId: string;
  createdAt: string;
  expiresAt: string;
  lastSeenAt: string;
  ipAddress?: string;
  userAgent?: string;
  revokedAt?: string;
}

export interface WalletRecord {
  id: string;
  entityId: string;
  walletAddress: string;
  label?: string;
  status: WalletStatus;
  chainSyncStatus: ChainSyncStatus;
  whitelistEntry?: string;
  chainTxSignature?: string;
  syncError?: string;
  requestedBy: string;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes?: string;
  chainSyncAttemptedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuditEventRecord {
  id: string;
  actorId: string;
  actorEmail: string;
  action: string;
  resourceType: string;
  resourceId: string;
  summary: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface KycWebhookRecord {
  id: string;
  entityId?: string;
  provider: KycProvider;
  payloadType: string;
  verified: boolean;
  createdAt: string;
  applicantId?: string;
  correlationId?: string;
  digestAlg?: string;
  eventCreatedAt?: string;
  externalUserId?: string;
  payloadDigest?: string;
  reviewAnswer?: 'GREEN' | 'RED';
  reviewStatus?: string;
}

export interface ReportRecord {
  id: string;
  month: string;
  status: ReportJobStatus;
  generatedBy: string;
  createdAt: string;
  generatedAt?: string;
  artifactPath?: string;
  artifactMimeType?: string;
  downloadName?: string;
  rowCount?: number;
  metrics: {
    entityCount: number;
    approvedWalletCount: number;
    totalCaseCount: number;
    openCaseCount: number;
    approvedCaseCount: number;
    rejectedCaseCount: number;
    escalatedCaseCount: number;
  };
}

export interface PilotStore {
  users: UserRecord[];
  sessions: SessionRecord[];
  entities: EntityRecord[];
  wallets: WalletRecord[];
  transactionCases: ReviewedTransaction[];
  aiAdvisories?: AiAdvisoryRecord[];
  aiFeedback?: AiAdvisoryFeedbackRecord[];
  auditEvents: AuditEventRecord[];
  reports: ReportRecord[];
  kycWebhooks: KycWebhookRecord[];
}

export interface WalletWhitelistSyncResult {
  whitelistEntry: string;
  signature: string;
}

export const entityWorkflowStates = [
  EntityStatus.Draft,
  EntityStatus.Submitted,
  EntityStatus.KycPending,
  EntityStatus.UnderReview,
  EntityStatus.Approved,
  EntityStatus.Rejected,
] as const;

export const walletWorkflowStates = [
  WalletStatus.Submitted,
  WalletStatus.UnderReview,
  WalletStatus.Approved,
  WalletStatus.ProposalPending,
  WalletStatus.Rejected,
  WalletStatus.Synced,
  WalletStatus.SyncFailed,
] as const;

export const transactionCaseWorkflowStates = [
  TransactionCaseStatus.Open,
  TransactionCaseStatus.UnderReview,
  TransactionCaseStatus.Approved,
  TransactionCaseStatus.Rejected,
  TransactionCaseStatus.Escalated,
] as const;

export const reportWorkflowStates = [
  ReportJobStatus.Queued,
  ReportJobStatus.Generated,
  ReportJobStatus.Failed,
] as const;

export const pilotRolePermissions: Record<UserRole, string[]> = {
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
