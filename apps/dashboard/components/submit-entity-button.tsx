'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { submitEntityAction } from '../app/actions';

export function SubmitEntityButton({ entityId }: { entityId: string }) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAction() {
    setIsPending(true);
    setError(null);

    const result = await submitEntityAction(entityId);
    
    if (result.error) {
      setError(result.error);
      setIsPending(false);
    } else {
      router.refresh();
      setIsPending(false);
    }
  }

  return (
    <div>
      <button 
        onClick={handleAction}
        disabled={isPending}
        style={{
          padding: '0.75rem 1.5rem',
          background: isPending ? '#555' : '#0d6efd',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          fontWeight: 'bold',
          cursor: isPending ? 'not-allowed' : 'pointer'
        }}
      >
        {isPending ? 'Submitting...' : 'Submit to Sumsub KYC'}
      </button>
      {error && (
        <p style={{ color: '#ff4d4f', marginTop: '0.5rem', fontSize: '0.875rem' }}>
          {error}
        </p>
      )}
    </div>
  );
}
