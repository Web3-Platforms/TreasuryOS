import assert from 'node:assert/strict';
import test from 'node:test';

import { deriveTransactionRules, requiresManualReview } from '../packages/compliance-rules/src/index.js';
import { RiskLevel } from '../packages/types/src/index.js';

test('transaction rules cover amount, high-risk entities, and manual review flags', () => {
  assert.deepEqual(
    deriveTransactionRules({
      amount: '250.00',
      manualReviewRequested: false,
      riskLevel: RiskLevel.Medium,
    }),
    [],
  );

  assert.deepEqual(
    deriveTransactionRules({
      amount: '1500.00',
      manualReviewRequested: true,
      riskLevel: RiskLevel.High,
    }),
    ['amount_threshold', 'high_risk_entity', 'manual_review_requested'],
  );

  assert.equal(
    requiresManualReview({
      manualReviewRequested: true,
      riskLevel: RiskLevel.Low,
    }),
    true,
  );
});
