'use client';

import { useTransition, useState } from 'react';
import { useRouter } from 'next/navigation';
import { generateReportAction } from '@/app/actions';

export function CreateReportForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [month, setMonth] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const handleAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!month) return;

    setError(null);
    setNotice(null);

    startTransition(async () => {
      const result = await generateReportAction(month);
      if ('error' in result) {
        setError(result.error);
        return;
      }

      setNotice(`Report for ${result.month} is available below.`);
      setMonth('');
      router.refresh();
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'flex-end' }}>
      {error && <div style={{ color: '#ff4d4f', fontSize: '0.875rem' }}>{error}</div>}
      {notice && <div style={{ color: '#7ee787', fontSize: '0.875rem' }}>{notice}</div>}
      <form onSubmit={handleAction} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <input 
          type="month" 
          required 
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #333', background: '#000', color: '#fff' }}
        />
        <button 
          type="submit" 
          disabled={isPending || !month}
          style={{ padding: '0.5rem 1rem', background: '#0d6efd', color: '#fff', border: 'none', borderRadius: '4px', cursor: isPending || !month ? 'not-allowed' : 'pointer' }}
        >
          {isPending ? 'Generating...' : 'Generate New Report'}
        </button>
      </form>
    </div>
  );
}
