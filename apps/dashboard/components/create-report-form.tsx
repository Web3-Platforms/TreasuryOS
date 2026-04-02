'use client';

import { useActionState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { generateReportAction } from '@/app/actions';

const initialState = {
  error: null,
  notice: null,
};

function getDefaultReportMonth() {
  return new Date().toISOString().slice(0, 7);
}

export function CreateReportForm() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(generateReportAction, initialState);
  const defaultMonth = getDefaultReportMonth();

  useEffect(() => {
    if (state.notice) {
      router.refresh();
    }
  }, [router, state.notice]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'flex-end' }}>
      {state.error && <div style={{ color: '#ff4d4f', fontSize: '0.875rem' }}>{state.error}</div>}
      {state.notice && <div style={{ color: '#7ee787', fontSize: '0.875rem' }}>{state.notice}</div>}
      <form action={formAction} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <label htmlFor="report-month" style={{ color: '#888', fontSize: '0.875rem' }}>
            Reporting month
          </label>
          <input
            id="report-month"
            name="month"
            type="month"
            required
            defaultValue={defaultMonth}
            max={defaultMonth}
            style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #333', background: '#000', color: '#fff' }}
          />
        </div>
        <button
          type="submit"
          disabled={isPending}
          style={{ padding: '0.5rem 1rem', background: '#0d6efd', color: '#fff', border: 'none', borderRadius: '4px', cursor: isPending ? 'not-allowed' : 'pointer' }}
        >
          {isPending ? 'Generating...' : 'Generate New Report'}
        </button>
      </form>
      <div style={{ color: '#666', fontSize: '0.75rem' }}>
        Defaults to the current month. You can change it before generating.
      </div>
    </div>
  );
}
