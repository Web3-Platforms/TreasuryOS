'use client';

import { useTransition, useState } from 'react';
import { generateReportAction } from '@/app/actions';

export function CreateReportForm() {
  const [isPending, startTransition] = useTransition();
  const [month, setMonth] = useState('');

  const handleAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!month) return;
    
    startTransition(async () => {
      const result = await generateReportAction(month);
      if (result?.error) {
        alert(result.error);
      }
    });
  };

  return (
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
  );
}
