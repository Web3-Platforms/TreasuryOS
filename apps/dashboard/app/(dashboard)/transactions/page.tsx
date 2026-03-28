import { fetchApi } from '@/lib/api-client';
import { AppShell } from '@/components/app-shell';
import type { ReviewedTransaction } from '@treasuryos/types';
import Link from 'next/link';

export default async function TransactionsPage() {
  let cases: ReviewedTransaction[] = [];
  
  try {
    const data = await fetchApi<{ cases: ReviewedTransaction[] }>('transaction-cases');
    cases = data.cases || [];
  } catch (error) {
    console.error('Failed to load transaction cases:', error);
  }

  return (
    <AppShell>
      <div style={{ padding: '2rem' }}>
        <h1 style={{ marginBottom: '1.5rem', marginTop: 0 }}>Transaction Case Queue</h1>
        
        {cases.length === 0 ? (
          <div style={{ background: '#111', padding: '2rem', borderRadius: '8px', textAlign: 'center', color: '#888' }}>
            No transaction cases found in the system.
          </div>
        ) : (
          <div style={{ background: '#111', borderRadius: '8px', overflow: 'hidden', border: '1px solid #333' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#222', borderBottom: '1px solid #333' }}>
                  <th style={{ padding: '1rem', fontWeight: 500, color: '#ccc' }}>Reference</th>
                  <th style={{ padding: '1rem', fontWeight: 500, color: '#ccc' }}>Entity ID</th>
                  <th style={{ padding: '1rem', fontWeight: 500, color: '#ccc' }}>Amount</th>
                  <th style={{ padding: '1rem', fontWeight: 500, color: '#ccc' }}>Risk Level</th>
                  <th style={{ padding: '1rem', fontWeight: 500, color: '#ccc' }}>Case Status</th>
                  <th style={{ padding: '1rem', fontWeight: 500, color: '#ccc' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {cases.map((txCase) => (
                  <tr key={txCase.id} style={{ borderBottom: '1px solid #333' }}>
                    <td style={{ padding: '1rem', fontFamily: 'monospace', fontSize: '0.875rem' }}>
                      {txCase.transactionReference || txCase.id.split('-')[0]}
                    </td>
                    <td style={{ padding: '1rem', fontFamily: 'monospace', fontSize: '0.875rem', color: '#aaa' }}>
                      <Link href={`/entities/${txCase.entityId}`} style={{ color: '#0d6efd', textDecoration: 'none' }}>
                        {txCase.entityId.substring(0, 8)}...
                      </Link>
                    </td>
                    <td style={{ padding: '1rem', fontFamily: 'monospace' }}>
                      {parseFloat(txCase.amount).toLocaleString()} {txCase.asset}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ 
                        padding: '0.25rem 0.5rem', 
                        background: txCase.riskLevel === 'high' ? '#842029' 
                                  : txCase.riskLevel === 'medium' ? '#997404' 
                                  : '#0f5132', 
                        borderRadius: '4px', 
                        fontSize: '0.875rem' 
                      }}>
                        {txCase.riskLevel.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ 
                        padding: '0.25rem 0.5rem', 
                        background: txCase.caseStatus === 'approved' ? '#0f5132' 
                                  : txCase.caseStatus === 'rejected' ? '#842029' 
                                  : txCase.caseStatus === 'under_review' ? '#084298'
                                  : txCase.caseStatus === 'escalated' ? '#6610f2'
                                  : '#333', 
                        borderRadius: '4px', 
                        fontSize: '0.875rem' 
                      }}>
                        {txCase.caseStatus}
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <Link href={`/transactions/${txCase.id}`} style={{ color: '#0d6efd', textDecoration: 'none', fontWeight: 500 }}>
                        Review &rarr;
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppShell>
  );
}
