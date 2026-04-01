'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { submitEntityAction } from '../app/actions';

type SubmitEntityButtonProps = {
  entityId: string;
  enabled?: boolean;
  disabledDescription?: string;
};

export function SubmitEntityButton({
  entityId,
  enabled = true,
  disabledDescription,
}: SubmitEntityButtonProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isDisabled = isPending || !enabled;

  async function handleAction() {
    if (!enabled) {
      return;
    }

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
        disabled={isDisabled}
        style={{
          padding: '0.75rem 1.5rem',
          background: isDisabled ? '#555' : '#0d6efd',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          fontWeight: 'bold',
          cursor: isDisabled ? 'not-allowed' : 'pointer'
        }}
      >
        {!enabled ? 'Sumsub KYC coming soon' : isPending ? 'Submitting...' : 'Submit to Sumsub KYC'}
      </button>
      {!enabled && disabledDescription && (
        <p style={{ color: '#d9a441', marginTop: '0.5rem', fontSize: '0.875rem' }}>
          {disabledDescription}
        </p>
      )}
      {error && (
        <p style={{ color: '#ff4d4f', marginTop: '0.5rem', fontSize: '0.875rem' }}>
          {error}
        </p>
      )}
    </div>
  );
}
