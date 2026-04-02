import { fetchApi } from '@/lib/api-client';
import { AppShell } from '@/components/app-shell';
import {
  EntityStatus,
  KycStatus,
  WalletStatus,
  type EntityRecord,
  type ReviewedTransaction,
  type WalletRecord,
} from '@treasuryos/types';
import Link from 'next/link';
import { ScreenTransactionForm } from '@/components/screen-transaction-form';

export default async function TransactionsPage() {
  let cases: ReviewedTransaction[] = [];
  let queueLoadError: string | null = null;
  let screeningLoadError: string | null = null;
  let screeningEntities: Array<{
    id: string;
    legalName: string;
    wallets: Array<{
      id: string;
      status: WalletRecord['status'];
      walletAddress: string;
    }>;
  }> = [];

  const [casesResult, entitiesResult, walletsResult] = await Promise.allSettled([
    fetchApi<{ cases: ReviewedTransaction[] }>('transaction-cases', {
      next: { revalidate: 0 },
    }),
    fetchApi<{ entities: EntityRecord[] }>('entities', {
      next: { revalidate: 0 },
    }),
    fetchApi<{ wallets: WalletRecord[] }>('wallets', {
      next: { revalidate: 0 },
    }),
  ]);

  if (casesResult.status === 'fulfilled') {
    cases = casesResult.value.cases || [];
  } else {
    console.error('Failed to load transaction cases:', casesResult.reason);
    queueLoadError = 'Transaction cases could not be loaded from the API.';
  }

  if (entitiesResult.status === 'fulfilled' && walletsResult.status === 'fulfilled') {
    const entities = entitiesResult.value.entities || [];
    const wallets = walletsResult.value.wallets || [];

    screeningEntities = entities
      .filter((entity) => entity.status === EntityStatus.Approved && entity.kycStatus === KycStatus.Approved)
      .map((entity) => ({
        id: entity.id,
        legalName: entity.legalName,
        wallets: wallets
          .filter(
            (wallet) =>
              wallet.entityId === entity.id &&
              (wallet.status === WalletStatus.Approved || wallet.status === WalletStatus.Synced),
          )
          .map((wallet) => ({
            id: wallet.id,
            status: wallet.status,
            walletAddress: wallet.walletAddress,
          })),
      }))
      .filter((entity) => entity.wallets.length > 0);
  } else {
    console.error('Failed to load transaction screening options:', {
      entitiesError: entitiesResult.status === 'rejected' ? entitiesResult.reason : null,
      walletsError: walletsResult.status === 'rejected' ? walletsResult.reason : null,
    });
    screeningLoadError = 'Transaction screening options could not be loaded.';
  }

  return (
    <AppShell>
      <div style={{ padding: '2rem' }}>
        <h1 style={{ marginBottom: '0.5rem', marginTop: 0 }}>Transaction Case Queue</h1>
        <p style={{ marginTop: 0, marginBottom: '1.5rem', color: '#888', maxWidth: '52rem' }}>
          This queue shows only screened transactions that triggered review rules or were explicitly marked for
          manual review. Cleared screenings do not appear here.
        </p>

        {screeningLoadError ? (
          <div style={{ background: '#2a1200', border: '1px solid #8a4b08', color: '#f0c36d', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
            {screeningLoadError}
          </div>
        ) : screeningEntities.length > 0 ? (
          <ScreenTransactionForm entities={screeningEntities} />
        ) : (
          <div style={{ background: '#111', border: '1px solid #333', padding: '1.25rem', borderRadius: '8px', marginBottom: '1.5rem', color: '#aaa' }}>
            No approved or synced entity wallets are available for screening yet. Approve an entity and wallet first,
            then return here to open transaction review cases.
          </div>
        )}

        {queueLoadError ? (
          <div style={{ background: '#2a1200', border: '1px solid #8a4b08', color: '#f0c36d', padding: '1rem', borderRadius: '8px' }}>
            {queueLoadError}
          </div>
        ) : cases.length === 0 ? (
          <div style={{ background: '#111', padding: '2rem', borderRadius: '8px', textAlign: 'center', color: '#888' }}>
            No transaction cases are waiting for review right now. Screen a transaction above to open a case when a
            rule triggers, or use manual review to force one into the queue.
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
