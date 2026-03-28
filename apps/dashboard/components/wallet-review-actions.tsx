'use client';

import { useState } from 'react';
import { reviewWalletAction, approveWalletAction, rejectWalletAction } from '../app/actions';
import type { WalletStatus } from '@treasuryos/types';

interface WalletReviewActionsProps {
  walletId: string;
  status: WalletStatus;
}

export function WalletReviewActions({ walletId, status }: WalletReviewActionsProps) {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAction = async (actionFn: (id: string) => Promise<{ success?: boolean; error?: string }>) => {
    setIsPending(true);
    setError(null);
    try {
      const result = await actionFn(walletId);
      if (result?.error) {
        setError(result.error);
      }
    } catch (err) {
      setError('An unexpected error occurred.');
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'flex-end' }}>
      {error && (
        <div style={{ color: '#ff4d4f', fontSize: '0.875rem' }}>{error}</div>
      )}
      <div style={{ display: 'flex', gap: '1rem' }}>
        {status === 'submitted' && (
          <button
            onClick={() => handleAction(reviewWalletAction)}
            disabled={isPending}
            style={{
              padding: '0.5rem 1rem',
              background: '#0d6efd',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontWeight: 500,
              cursor: isPending ? 'not-allowed' : 'pointer',
              opacity: isPending ? 0.7 : 1
            }}
          >
            {isPending ? 'Processing...' : 'Mark Under Review'}
          </button>
        )}

        {status === 'under_review' && (
          <>
            <button
              onClick={() => handleAction(rejectWalletAction)}
              disabled={isPending}
              style={{
                padding: '0.5rem 1rem',
                background: 'transparent',
                color: '#ff4d4f',
                border: '1px solid #ff4d4f',
                borderRadius: '4px',
                fontWeight: 500,
                cursor: isPending ? 'not-allowed' : 'pointer',
                opacity: isPending ? 0.7 : 1
              }}
            >
              Reject
            </button>
            <button
              onClick={() => handleAction(approveWalletAction)}
              disabled={isPending}
              style={{
                padding: '0.5rem 1rem',
                background: '#198754',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontWeight: 500,
                cursor: isPending ? 'not-allowed' : 'pointer',
                opacity: isPending ? 0.7 : 1
              }}
            >
              {isPending ? 'Processing...' : 'Approve & Whitelist'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
