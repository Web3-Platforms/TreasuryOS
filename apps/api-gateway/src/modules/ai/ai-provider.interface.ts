import type {
  AiAdvisoryRecord,
  AiProviderKind,
  EntityRecord,
  ReviewedTransaction,
  WalletRecord,
} from '@treasuryos/types';

export type AiProviderPolicy = Pick<AiAdvisoryRecord, 'model' | 'promptVersion' | 'provider'>;

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
  | 'checklist'
  | 'confidence'
  | 'fallbackUsed'
  | 'model'
  | 'promptVersion'
  | 'provider'
  | 'providerLatencyMs'
  | 'recommendation'
  | 'riskFactors'
  | 'summary'
> & {
  notice?: string;
};

export class AiProviderError extends Error {
  constructor(
    message: string,
    readonly details: {
      code: 'invalid_response' | 'request_failed' | 'timeout';
      operatorMessage: string;
      provider: AiProviderKind;
      statusCode?: number;
    },
  ) {
    super(message);
    this.name = 'AiProviderError';
  }
}

export interface AiProvider {
  getPolicy(): AiProviderPolicy;
  generateTransactionCaseAdvisory(
    context: TransactionCaseAdvisoryContext,
  ): Promise<GeneratedAiAdvisory>;
}

export const AI_PROVIDER = Symbol('AI_PROVIDER');
