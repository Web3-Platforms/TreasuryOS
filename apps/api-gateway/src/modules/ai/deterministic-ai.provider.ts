import { Injectable } from '@nestjs/common';
import { RiskLevel, TransactionCaseStatus } from '@treasuryos/types';

import { loadApiGatewayEnv } from '../../config/env.js';
import type {
  AiProvider,
  AiProviderPolicy,
  GeneratedAiAdvisory,
  TransactionCaseAdvisoryContext,
} from './ai-provider.interface.js';

const DETERMINISTIC_PROMPT_VERSION = 'deterministic-tx-case-v1';
const DETERMINISTIC_FALLBACK_MODEL = 'deterministic-case-advisor-v1';

function joinWithAnd(values: string[]) {
  if (values.length === 0) {
    return '';
  }

  if (values.length === 1) {
    return values[0];
  }

  if (values.length === 2) {
    return `${values[0]} and ${values[1]}`;
  }

  return `${values.slice(0, -1).join(', ')}, and ${values.at(-1)}`;
}

function humanizeRule(rule: string) {
  switch (rule) {
    case 'amount_threshold':
      return 'the transaction amount crosses the pilot travel-rule threshold';
    case 'high_risk_entity':
      return 'the entity is already classified as high risk';
    case 'manual_review_requested':
      return 'manual review was requested explicitly';
    default:
      return `the ${rule.replaceAll('_', ' ')} rule fired`;
  }
}

function summarizeStatus(status: TransactionCaseAdvisoryContext['caseStatus']) {
  switch (status) {
    case TransactionCaseStatus.Open:
      return 'is open and awaiting a human decision';
    case TransactionCaseStatus.UnderReview:
      return 'is under active human review';
    case TransactionCaseStatus.Approved:
      return 'has been approved by a human reviewer';
    case TransactionCaseStatus.Rejected:
      return 'has been rejected by a human reviewer';
    case TransactionCaseStatus.Escalated:
      return 'has been escalated for additional human sign-off';
    default:
      return `is currently ${status}`;
  }
}

function dedupe(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}

@Injectable()
export class DeterministicAiProvider implements AiProvider {
  private readonly env = loadApiGatewayEnv();

  getPolicy(): AiProviderPolicy {
    return {
      model:
        this.env.AI_PROVIDER === 'deterministic'
          ? this.env.AI_ADVISORY_MODEL
          : DETERMINISTIC_FALLBACK_MODEL,
      promptVersion: DETERMINISTIC_PROMPT_VERSION,
      provider: 'deterministic',
    };
  }

  async generateTransactionCaseAdvisory(
    context: TransactionCaseAdvisoryContext,
  ): Promise<GeneratedAiAdvisory> {
    const ruleReasons = context.triggeredRules.map(humanizeRule);
    const summaryParts = [
      `Case ${context.transactionReference} ${summarizeStatus(context.caseStatus)}.`,
      `It belongs to ${context.entity.legalName} and carries a ${context.riskLevel} risk classification.`,
      ruleReasons.length > 0
        ? `Screening flagged it because ${joinWithAnd(ruleReasons)}.`
        : 'An analyst requested manual attention even though no rule text was attached.',
      context.evidenceRef
        ? `Supporting evidence is linked as ${context.evidenceRef}.`
        : 'No evidence reference is attached yet.',
    ];

    if (context.reviewNotes) {
      summaryParts.push('Reviewer notes already exist and should remain part of the human decision record.');
    }

    if (context.caseStatus === TransactionCaseStatus.Escalated) {
      summaryParts.push('Do not treat the case as resolved until the additional sign-off is captured.');
    }

    const riskFactors = dedupe([
      `Entity risk level is ${context.entity.riskLevel}.`,
      ...ruleReasons.map((reason) => `Screening signal: ${reason}.`),
      context.manualReviewRequested ? 'Manual review was explicitly requested.' : '',
      !context.evidenceRef ? 'The case does not yet have a linked evidence reference.' : '',
      context.wallet ? `Linked wallet is currently ${context.wallet.status}.` : '',
      context.resolutionReason ? `Recorded resolution reason is ${context.resolutionReason}.` : '',
    ]);

    const checklist = dedupe([
      `Confirm the business purpose and beneficiary for reference ${context.transactionReference}.`,
      'Match each triggered rule to documentary evidence and capture the evidence reference in the case.',
      `Verify source wallet ${context.sourceWallet} and destination wallet ${context.destinationWallet} against approved ownership or documented counterparty context.`,
      context.manualReviewRequested
        ? 'Record who requested manual review and whether the original concern was cleared.'
        : '',
      !context.reviewNotes ? 'Add reviewer notes before final disposition so the human rationale is explicit.' : '',
      context.riskLevel === RiskLevel.High || context.riskLevel === RiskLevel.Critical
        ? 'Require senior compliance confirmation before final approval because the entity is high risk.'
        : '',
      context.caseStatus === TransactionCaseStatus.Escalated
        ? 'Keep the case escalated until the higher-tier reviewer records the final disposition.'
        : '',
    ]);

    let recommendation =
      'Keep this case in human review until beneficiary context, wallet ownership, and supporting evidence are explicitly documented.';

    if (context.caseStatus === TransactionCaseStatus.Approved) {
      recommendation =
        'Treat the recorded approval as the decision of record, but keep the attached rationale and evidence reference audit-ready.';
    } else if (context.caseStatus === TransactionCaseStatus.Rejected) {
      recommendation =
        'Maintain the rejection unless new beneficiary evidence or counterparty context materially changes the case.';
    } else if (context.caseStatus === TransactionCaseStatus.Escalated) {
      recommendation =
        'Preserve the escalation until the additional reviewer or committee records the final human outcome.';
    }

    let confidence = 0.45;
    confidence += Math.min(context.triggeredRules.length * 0.1, 0.2);
    confidence += context.reviewNotes ? 0.1 : 0;
    confidence += context.evidenceRef ? 0.1 : 0;
    confidence += context.wallet ? 0.05 : 0;

    return {
      checklist,
      confidence: Number(Math.min(confidence, 0.9).toFixed(2)),
      fallbackUsed: false,
      model: this.getPolicy().model,
      promptVersion: DETERMINISTIC_PROMPT_VERSION,
      provider: 'deterministic',
      providerLatencyMs: undefined,
      recommendation,
      riskFactors,
      summary: summaryParts.join(' '),
    };
  }
}
