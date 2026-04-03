'use client';

import { useState, useTransition } from 'react';

import { generateTransactionCaseAdvisoryAction } from '@/app/actions';
import { AiAdvisoryFeedbackForm } from '@/components/ai-advisory-feedback-form';
import type { AiAdvisoryEnvelope } from '@treasuryos/types';

export function TransactionAiAdvisoryPanel({
  caseId,
  initialAdvisory,
  initialLoadError,
}: {
  caseId: string;
  initialAdvisory: AiAdvisoryEnvelope | null;
  initialLoadError: string | null;
}) {
  const [advisoryEnvelope, setAdvisoryEnvelope] = useState<AiAdvisoryEnvelope | null>(initialAdvisory);
  const [loadError, setLoadError] = useState(initialLoadError);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const advisory = advisoryEnvelope?.enabled ? advisoryEnvelope.advisory : null;
  const aiDisabled = advisoryEnvelope?.enabled === false;
  const panelNotice = actionNotice ?? advisoryEnvelope?.notice ?? null;

  function handleGenerate() {
    const wasRegeneration = Boolean(advisory);
    setActionError(null);
    setActionNotice(null);

    startTransition(async () => {
      const result = await generateTransactionCaseAdvisoryAction(caseId);

      if ('error' in result) {
        setActionError(result.error);
        return;
      }

      setAdvisoryEnvelope(result);
      setLoadError(null);
      setActionNotice(
        result.notice ??
          (result.advisory
            ? wasRegeneration
              ? 'AI analysis regenerated.'
              : 'AI analysis generated.'
            : null),
      );
    });
  }

  return (
    <div style={{ background: '#111', border: '1px solid #333', borderRadius: '8px', padding: '1.5rem', marginBottom: '2rem' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '1rem',
          marginBottom: '1rem',
          borderBottom: '1px solid #333',
          paddingBottom: '0.5rem',
        }}
      >
        <h2 style={{ fontSize: '1.25rem', margin: 0 }}>AI Advisory</h2>
        {!aiDisabled ? (
          <button
            onClick={handleGenerate}
            disabled={isPending}
            style={{
              padding: '0.65rem 1rem',
              background: advisory ? '#6f42c1' : '#0d6efd',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: isPending ? 'wait' : 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            {isPending
              ? advisory
                ? 'Regenerating...'
                : 'Generating...'
              : advisory
                ? 'Regenerate AI Analysis'
                : 'Generate AI Analysis'}
          </button>
        ) : null}
      </div>

      {loadError ? (
        <div style={{ background: '#2a1200', border: '1px solid #8a4b08', color: '#f0c36d', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
          {loadError}
        </div>
      ) : null}

      {actionError ? (
        <div style={{ background: '#3a1118', border: '1px solid #a0303b', color: '#ffb3b8', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
          {actionError}
        </div>
      ) : null}

      {panelNotice ? (
        <div style={{ background: '#2a2100', border: '1px solid #8a6d08', color: '#f0d26d', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
          {panelNotice}
        </div>
      ) : null}

      {aiDisabled ? (
        <div style={{ background: '#0f1a2b', border: '1px solid #1f4f82', color: '#a9c7ea', padding: '1rem', borderRadius: '8px' }}>
          {advisoryEnvelope?.reason ?? 'AI advisories are not available for this environment yet.'}
        </div>
      ) : advisory ? (
        <div style={{ display: 'grid', gap: '1rem' }}>
          <div>
            <div style={{ color: '#888', fontSize: '0.875rem', marginBottom: '0.35rem' }}>Summary</div>
            <div style={{ color: '#ddd', lineHeight: 1.6 }}>{advisory.summary}</div>
          </div>

          {advisory.recommendation ? (
            <div>
              <div style={{ color: '#888', fontSize: '0.875rem', marginBottom: '0.35rem' }}>Recommendation</div>
              <div style={{ color: '#ddd', lineHeight: 1.6 }}>{advisory.recommendation}</div>
            </div>
          ) : null}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div>
              <div style={{ color: '#888', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Risk Factors</div>
              {advisory.riskFactors.length > 0 ? (
                <ul style={{ margin: 0, paddingLeft: '1.2rem', color: '#ddd', lineHeight: 1.7 }}>
                  {advisory.riskFactors.map((factor) => (
                    <li key={factor}>{factor}</li>
                  ))}
                </ul>
              ) : (
                <div style={{ color: '#888' }}>No additional risk factors were generated.</div>
              )}
            </div>

            <div>
              <div style={{ color: '#888', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Operator Checklist</div>
              {advisory.checklist.length > 0 ? (
                <ol style={{ margin: 0, paddingLeft: '1.2rem', color: '#ddd', lineHeight: 1.7 }}>
                  {advisory.checklist.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ol>
              ) : (
                <div style={{ color: '#888' }}>No checklist items were generated.</div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', color: '#888', fontSize: '0.875rem' }}>
            <span>Provider: {advisory.provider}</span>
            <span>Model: {advisory.model}</span>
            <span>Prompt: {advisory.promptVersion}</span>
            <span>Fallback: {advisory.fallbackUsed ? 'deterministic used' : 'no'}</span>
            {typeof advisory.confidence === 'number' ? (
              <span>Confidence: {Math.round(advisory.confidence * 100)}%</span>
            ) : null}
            {typeof advisory.providerLatencyMs === 'number' ? (
              <span>Latency: {advisory.providerLatencyMs} ms</span>
            ) : null}
            <span>Generated: {new Date(advisory.generatedAt).toLocaleString()}</span>
            <span>Redaction: {advisory.redactionProfile}</span>
          </div>

          <AiAdvisoryFeedbackForm
            key={`${advisory.id}:${advisory.updatedAt}`}
            advisoryId={advisory.id}
            caseId={caseId}
          />
        </div>
      ) : (
        <div style={{ background: '#0f1a2b', border: '1px solid #1f4f82', color: '#a9c7ea', padding: '1rem', borderRadius: '8px' }}>
          {advisoryEnvelope?.reason ?? 'Click "Generate AI Analysis" to request an advisory for this transaction case.'}
        </div>
      )}
    </div>
  );
}
