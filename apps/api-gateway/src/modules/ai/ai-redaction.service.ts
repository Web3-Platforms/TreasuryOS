import { createHash } from 'node:crypto';

import { Injectable } from '@nestjs/common';
import type { EntityRecord, ReviewedTransaction, WalletRecord } from '@treasuryos/types';

import type { TransactionCaseAdvisoryContext } from './ai-provider.interface.js';

type TransactionCaseRedactionInput = {
  entity: EntityRecord;
  transactionCase: ReviewedTransaction;
  wallet?: WalletRecord;
};

function maskWalletAddress(value: string) {
  if (value.length <= 12) {
    return value;
  }

  return `${value.slice(0, 6)}...${value.slice(-6)}`;
}

function clipText(value: string | undefined, limit = 600) {
  if (!value) {
    return undefined;
  }

  const normalized = value.trim();

  if (normalized.length <= limit) {
    return normalized;
  }

  return `${normalized.slice(0, limit - 3)}...`;
}

@Injectable()
export class AiRedactionService {
  redactTransactionCase(input: TransactionCaseRedactionInput) {
    const context: TransactionCaseAdvisoryContext = {
      amount: input.transactionCase.amount,
      asset: input.transactionCase.asset,
      caseId: input.transactionCase.id,
      caseStatus: input.transactionCase.caseStatus,
      createdAt: input.transactionCase.createdAt,
      destinationWallet: maskWalletAddress(input.transactionCase.destinationWallet),
      entity: {
        id: input.entity.id,
        jurisdiction: input.entity.jurisdiction,
        kycStatus: input.entity.kycStatus,
        legalName: input.entity.legalName,
        riskLevel: input.entity.riskLevel,
        status: input.entity.status,
      },
      evidenceRef: clipText(input.transactionCase.evidenceRef, 200),
      jurisdiction: input.transactionCase.jurisdiction,
      manualReviewRequested: input.transactionCase.manualReviewRequested,
      notes: clipText(input.transactionCase.notes),
      resolutionReason: input.transactionCase.resolutionReason,
      reviewNotes: clipText(input.transactionCase.reviewNotes),
      reviewedAt: input.transactionCase.reviewedAt,
      riskLevel: input.transactionCase.riskLevel,
      sourceWallet: maskWalletAddress(input.transactionCase.sourceWallet),
      transactionReference: input.transactionCase.transactionReference,
      triggeredRules: [...input.transactionCase.triggeredRules],
      wallet: input.wallet
        ? {
            address: maskWalletAddress(input.wallet.walletAddress),
            id: input.wallet.id,
            status: input.wallet.status,
          }
        : undefined,
    };

    return {
      context,
      redactionProfile: 'transaction-case-v1',
      sourceHash: createHash('sha256').update(JSON.stringify(context)).digest('hex'),
    };
  }
}
