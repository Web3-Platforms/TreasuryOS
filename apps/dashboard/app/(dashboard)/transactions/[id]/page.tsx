import { fetchApi } from '@/lib/api-client';
import { AppShell } from '@/components/app-shell';
import type { ReviewedTransaction } from '@treasuryos/types';
import Link from 'next/link';
import { TransactionReviewActions } from '@/components/transaction-review-actions';

export default async function TransactionDetailPage({ params }: { params: { id: string } }) {
  let txCase: ReviewedTransaction | null = null;
  
  try {
    txCase = await fetchApi<ReviewedTransaction>(`transaction-cases/${params.id}`);
  } catch (error) {
    console.error(`Failed to load transaction case ${params.id}:`, error);
  }

  if (!txCase) {
    return (
      <AppShell>
        <div style={{ padding: '2rem' }}>
          <h1>Transaction Case Not Found</h1>
          <p>The transaction you are looking for does not exist or you do not have permission to view it.</p>
          <Link href="/transactions" style={{ color: '#0d6efd' }}>&larr; Back to Transactions</Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div style={{ padding: '2rem', maxWidth: '800px' }}>
        <div style={{ marginBottom: '2rem' }}>
          <Link href="/transactions" style={{ color: '#aaa', textDecoration: 'none' }}>&larr; Back to Transaction Queue</Link>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ margin: '0 0 0.5rem 0' }}>Transaction Detail</h1>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <span style={{ 
                padding: '0.25rem 0.5rem', 
                background: txCase.riskLevel === 'high' ? '#842029' 
                          : txCase.riskLevel === 'medium' ? '#997404' 
                          : '#0f5132', 
                borderRadius: '4px', 
                fontSize: '0.875rem' 
              }}>
                {txCase.riskLevel.toUpperCase()} RISK
              </span>
              <span style={{ padding: '0.25rem 0.5rem', background: '#333', borderRadius: '4px', fontSize: '0.875rem' }}>
                STATUS: {txCase.caseStatus}
              </span>
              <span style={{ color: '#888', fontSize: '0.875rem' }}>ID: {txCase.id}</span>
            </div>
          </div>
          
          <TransactionReviewActions caseId={txCase.id} status={txCase.caseStatus} />
        </div>

        <div style={{ background: '#111', border: '1px solid #333', borderRadius: '8px', padding: '1.5rem', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', marginTop: 0, marginBottom: '1rem', borderBottom: '1px solid #333', paddingBottom: '0.5rem' }}>
            Transaction Information
          </h2>
          <dl style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem', margin: 0 }}>
            <dt style={{ color: '#aaa', fontWeight: 500 }}>Reference</dt>
            <dd style={{ margin: 0, fontFamily: 'monospace' }}>{txCase.transactionReference}</dd>

            <dt style={{ color: '#aaa', fontWeight: 500 }}>Amount</dt>
            <dd style={{ margin: 0, fontFamily: 'monospace' }}>{parseFloat(txCase.amount).toLocaleString()} {txCase.asset}</dd>

            <dt style={{ color: '#aaa', fontWeight: 500 }}>Entity ID</dt>
            <dd style={{ margin: 0, fontFamily: 'monospace' }}>
              <Link href={`/entities/${txCase.entityId}`} style={{ color: '#0d6efd', textDecoration: 'none' }}>
                {txCase.entityId}
              </Link>
            </dd>

            <dt style={{ color: '#aaa', fontWeight: 500 }}>Jurisdiction</dt>
            <dd style={{ margin: 0 }}>{txCase.jurisdiction || 'Unknown'}</dd>

            <dt style={{ color: '#aaa', fontWeight: 500 }}>Source Wallet</dt>
            <dd style={{ margin: 0, fontFamily: 'monospace', wordBreak: 'break-all' }}>{txCase.sourceWallet}</dd>

            <dt style={{ color: '#aaa', fontWeight: 500 }}>Destination Wallet</dt>
            <dd style={{ margin: 0, fontFamily: 'monospace', wordBreak: 'break-all' }}>{txCase.destinationWallet}</dd>

            <dt style={{ color: '#aaa', fontWeight: 500 }}>Created At</dt>
            <dd style={{ margin: 0 }}>{new Date(txCase.createdAt).toLocaleString()}</dd>
          </dl>
        </div>

        <div style={{ background: '#111', border: '1px solid #333', borderRadius: '8px', padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', marginTop: 0, marginBottom: '1rem', borderBottom: '1px solid #333', paddingBottom: '0.5rem' }}>
            Compliance & Review Notes
          </h2>
          <dl style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem', margin: 0 }}>
            <dt style={{ color: '#aaa', fontWeight: 500 }}>Triggered Rules</dt>
            <dd style={{ margin: 0, fontFamily: 'monospace', color: '#888' }}>
              {txCase.triggeredRules && txCase.triggeredRules.length > 0 ? (
                <ul style={{ paddingLeft: '1.2rem', margin: 0 }}>
                  {txCase.triggeredRules.map((rule, idx) => <li key={idx}>{rule}</li>)}
                </ul>
              ) : 'None'}
            </dd>

            <dt style={{ color: '#aaa', fontWeight: 500 }}>Manual Review Requested</dt>
            <dd style={{ margin: 0 }}>{txCase.manualReviewRequested ? 'Yes' : 'No'}</dd>

            {txCase.reviewedAt && (
              <>
                <dt style={{ color: '#aaa', fontWeight: 500 }}>Reviewed At</dt>
                <dd style={{ margin: 0 }}>{new Date(txCase.reviewedAt).toLocaleString()}</dd>
              </>
            )}

            {txCase.reviewedBy && (
              <>
                <dt style={{ color: '#aaa', fontWeight: 500 }}>Reviewed By</dt>
                <dd style={{ margin: 0 }}>{txCase.reviewedBy}</dd>
              </>
            )}

            {txCase.notes && (
              <>
                <dt style={{ color: '#aaa', fontWeight: 500 }}>Review Notes</dt>
                <dd style={{ margin: 0, whiteSpace: 'pre-wrap', color: '#ddd' }}>{txCase.notes}</dd>
              </>
            )}
            
            {txCase.resolutionReason && (
              <>
                <dt style={{ color: '#aaa', fontWeight: 500 }}>Resolution Reason</dt>
                <dd style={{ margin: 0, whiteSpace: 'pre-wrap', color: '#ddd' }}>{txCase.resolutionReason}</dd>
              </>
            )}
          </dl>
        </div>
      </div>
    </AppShell>
  );
}
