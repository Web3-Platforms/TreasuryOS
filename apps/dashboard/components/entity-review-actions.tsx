'use client';

import { useState } from 'react';
import type { EntityStatus, KycStatus } from '@treasuryos/types';
import { approveEntityAction, rejectEntityAction } from '../app/actions';

interface EntityReviewActionsProps {
  entityId: string;
  status: EntityStatus;
  kycStatus: KycStatus;
}

export function EntityReviewActions({ entityId, status, kycStatus }: EntityReviewActionsProps) {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (status !== 'under_review') {
    return null;
  }

  const canApprove = kycStatus === 'Approved';

  const handleAction = async (actionFn: (id: string) => Promise<{ success?: boolean; error?: string }>) => {
    setIsPending(true);
    setError(null);
    try {
      const result = await actionFn(entityId);
      if (result?.error) {
        setError(result.error);
      }
    } catch {
      setError('An unexpected error occurred.');
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'flex-end' }}>
      {error && <div style={{ color: '#ff4d4f', fontSize: '0.875rem' }}>{error}</div>}
      {!canApprove && (
        <div style={{ color: '#f0c36d', fontSize: '0.875rem', maxWidth: '18rem', textAlign: 'right' }}>
          Approval becomes available after KYC reaches Approved.
        </div>
      )}
      <div style={{ display: 'flex', gap: '1rem' }}>
        <button
          onClick={() => handleAction(rejectEntityAction)}
          disabled={isPending}
          style={{
            padding: '0.5rem 1rem',
            background: 'transparent',
            color: '#ff4d4f',
            border: '1px solid #ff4d4f',
            borderRadius: '4px',
            fontWeight: 500,
            cursor: isPending ? 'not-allowed' : 'pointer',
            opacity: isPending ? 0.7 : 1,
          }}
        >
          Reject
        </button>
        <button
          onClick={() => handleAction(approveEntityAction)}
          disabled={isPending || !canApprove}
          style={{
            padding: '0.5rem 1rem',
            background: canApprove ? '#198754' : '#555',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontWeight: 500,
            cursor: isPending || !canApprove ? 'not-allowed' : 'pointer',
            opacity: isPending ? 0.7 : 1,
          }}
        >
          {isPending ? 'Processing...' : 'Approve Entity'}
        </button>
      </div>
    </div>
  );
}
