import type {
  AiAdvisoryRecord,
  EntityRecord,
  ReviewedTransaction,
  WalletRecord,
} from '@treasuryos/types';

export type TransactionCaseAdvisoryContext = {
  amount: string;
  asset: string;
  caseId: string;
  caseStatus: ReviewedTransaction['caseStatus'];
  createdAt: string;
  destinationWallet: string;
  entity: Pick<
    EntityRecord,
    'id' | 'jurisdiction' | 'kycStatus' | 'legalName' | 'riskLevel' | 'status'
  >;
  evidenceRef?: string;
  jurisdiction: ReviewedTransaction['jurisdiction'];
  manualReviewRequested: boolean;
  notes?: string;
  resolutionReason?: string;
  reviewNotes?: string;
  reviewedAt?: string;
  riskLevel: ReviewedTransaction['riskLevel'];
  sourceWallet: string;
  transactionReference: string;
  triggeredRules: string[];
  wallet?: {
    address: string;
    id: string;
    status: WalletRecord['status'];
  };
};

export type GeneratedAiAdvisory = Pick<
  AiAdvisoryRecord,
  'checklist' | 'confidence' | 'model' | 'recommendation' | 'riskFactors' | 'summary'
>;

export interface AiProvider {
  generateTransactionCaseAdvisory(
    context: TransactionCaseAdvisoryContext,
  ): Promise<GeneratedAiAdvisory>;
}

export const AI_PROVIDER = Symbol('AI_PROVIDER');
