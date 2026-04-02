'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { 
  reviewTransactionAction, 
  approveTransactionAction, 
  rejectTransactionAction, 
  escalateTransactionAction 
} from '@/app/actions';

export function TransactionReviewActions({ caseId, status }: { caseId: string; status: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleAction = (actionType: 'review' | 'approve' | 'reject' | 'escalate') => {
    startTransition(async () => {
      let result;
      
      const notes = actionType !== 'review' ? window.prompt('Enter review notes (optional):') || 'Automated action from dashboard' : '';

      switch (actionType) {
        case 'review':
          result = await reviewTransactionAction(caseId);
          break;
        case 'approve':
          result = await approveTransactionAction(caseId, notes);
          break;
        case 'reject':
          result = await rejectTransactionAction(caseId, notes);
          break;
        case 'escalate':
          result = await escalateTransactionAction(caseId, notes);
          break;
      }

      if (result?.error) {
        alert(result.error);
        return;
      }

      router.refresh();
    });
  };

  return (
    <div style={{ display: 'flex', gap: '0.5rem' }}>
      {status === 'open' && (
        <button 
          onClick={() => handleAction('review')} 
          disabled={isPending}
          style={{ padding: '0.5rem 1rem', background: '#0d6efd', color: '#fff', border: 'none', borderRadius: '4px', cursor: isPending ? 'wait' : 'pointer' }}
        >
          {isPending ? 'Processing...' : 'Start Review'}
        </button>
      )}

      {status === 'under_review' && (
        <>
          <button 
            onClick={() => handleAction('approve')} 
            disabled={isPending}
            style={{ padding: '0.5rem 1rem', background: '#198754', color: '#fff', border: 'none', borderRadius: '4px', cursor: isPending ? 'wait' : 'pointer' }}
          >
            {isPending ? 'Processing...' : 'Approve'}
          </button>
          <button 
            onClick={() => handleAction('reject')} 
            disabled={isPending}
            style={{ padding: '0.5rem 1rem', background: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px', cursor: isPending ? 'wait' : 'pointer' }}
          >
            {isPending ? 'Processing...' : 'Reject'}
          </button>
          <button 
            onClick={() => handleAction('escalate')} 
            disabled={isPending}
            style={{ padding: '0.5rem 1rem', background: '#6f42c1', color: '#fff', border: 'none', borderRadius: '4px', cursor: isPending ? 'wait' : 'pointer' }}
          >
            {isPending ? 'Processing...' : 'Escalate'}
          </button>
        </>
      )}
    </div>
  );
}
