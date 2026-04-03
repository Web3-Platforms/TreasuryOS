'use client';

import { useState, useTransition } from 'react';

import { submitAiAdvisoryFeedbackAction } from '@/app/actions';
import type { AiAdvisoryFeedbackDisposition, AiAdvisoryFeedbackHelpfulness } from '@treasuryos/types';

export function AiAdvisoryFeedbackForm({ advisoryId, caseId }: { advisoryId: string; caseId: string }) {
  const [helpfulness, setHelpfulness] = useState<AiAdvisoryFeedbackHelpfulness>('helpful');
  const [disposition, setDisposition] = useState<AiAdvisoryFeedbackDisposition>('accepted');
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setNotice(null);

    startTransition(async () => {
      const result = await submitAiAdvisoryFeedbackAction(advisoryId, caseId, {
        disposition,
        helpfulness,
        note: note.trim() || undefined,
      });

      if ('error' in result) {
        setError(result.error);
        return;
      }

      setNotice('Feedback saved for this advisory snapshot.');
    });
  }

  return (
    <div style={{ marginTop: '1.5rem', borderTop: '1px solid #333', paddingTop: '1.25rem' }}>
      <div style={{ color: '#888', fontSize: '0.875rem', marginBottom: '0.75rem' }}>Advisory Feedback</div>

      {error ? (
        <div style={{ padding: '0.75rem', background: '#ff4d4f22', color: '#ff9b9b', borderRadius: '6px', marginBottom: '0.75rem', border: '1px solid #7d1f26' }}>
          {error}
        </div>
      ) : null}

      {notice ? (
        <div style={{ padding: '0.75rem', background: '#0f513222', color: '#7ee787', borderRadius: '6px', marginBottom: '0.75rem', border: '1px solid #0f5132' }}>
          {notice}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '0.85rem' }}>
        <div style={{ display: 'grid', gap: '0.85rem', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
          <label style={{ display: 'grid', gap: '0.35rem', color: '#ccc', fontSize: '0.875rem' }}>
            Helpfulness
            <select
              value={helpfulness}
              onChange={(event) => setHelpfulness(event.target.value as AiAdvisoryFeedbackHelpfulness)}
              disabled={isPending}
              style={{ padding: '0.7rem', borderRadius: '4px', border: '1px solid #333', background: '#222', color: 'white' }}
            >
              <option value="helpful">Helpful</option>
              <option value="not_helpful">Not helpful</option>
            </select>
          </label>

          <label style={{ display: 'grid', gap: '0.35rem', color: '#ccc', fontSize: '0.875rem' }}>
            Outcome
            <select
              value={disposition}
              onChange={(event) => setDisposition(event.target.value as AiAdvisoryFeedbackDisposition)}
              disabled={isPending}
              style={{ padding: '0.7rem', borderRadius: '4px', border: '1px solid #333', background: '#222', color: 'white' }}
            >
              <option value="accepted">Accepted</option>
              <option value="edited">Edited</option>
              <option value="dismissed">Dismissed</option>
            </select>
          </label>
        </div>

        <label style={{ display: 'grid', gap: '0.35rem', color: '#ccc', fontSize: '0.875rem' }}>
          Note (optional)
          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            disabled={isPending}
            maxLength={2000}
            rows={3}
            placeholder="What made this advisory useful or not useful?"
            style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid #333', background: '#222', color: 'white', resize: 'vertical' }}
          />
        </label>

        <div>
          <button
            type="submit"
            disabled={isPending}
            style={{ padding: '0.65rem 1rem', background: '#0d6efd', color: '#fff', border: 'none', borderRadius: '4px', cursor: isPending ? 'wait' : 'pointer' }}
          >
            {isPending ? 'Saving Feedback...' : 'Save Advisory Feedback'}
          </button>
        </div>
      </form>
    </div>
  );
}
