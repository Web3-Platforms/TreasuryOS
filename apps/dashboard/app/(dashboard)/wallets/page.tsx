import { fetchApi } from '@/lib/api-client';
import { AppShell } from '@/components/app-shell';
import type { WalletRecord } from '@treasuryos/types';
import Link from 'next/link';

export default async function WalletsPage() {
  let wallets: WalletRecord[] = [];
  
  try {
    const data = await fetchApi<{ wallets: WalletRecord[] }>('wallets');
    wallets = data.wallets || [];
  } catch (error) {
    console.error('Failed to load wallets:', error);
  }

  return (
    <AppShell>
      <div style={{ padding: '2rem' }}>
        <h1 style={{ marginBottom: '1.5rem', marginTop: 0 }}>Wallet Review Queue</h1>
        
        {wallets.length === 0 ? (
          <div style={{ background: '#111', padding: '2rem', borderRadius: '8px', textAlign: 'center', color: '#888' }}>
            No wallets found in the system.
          </div>
        ) : (
          <div style={{ background: '#111', borderRadius: '8px', overflow: 'hidden', border: '1px solid #333' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#222', borderBottom: '1px solid #333' }}>
                  <th style={{ padding: '1rem', fontWeight: 500, color: '#ccc' }}>Address</th>
                  <th style={{ padding: '1rem', fontWeight: 500, color: '#ccc' }}>Entity ID</th>
                  <th style={{ padding: '1rem', fontWeight: 500, color: '#ccc' }}>Overall Status</th>
                  <th style={{ padding: '1rem', fontWeight: 500, color: '#ccc' }}>Chain Sync</th>
                  <th style={{ padding: '1rem', fontWeight: 500, color: '#ccc' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {wallets.map((wallet) => (
                  <tr key={wallet.id} style={{ borderBottom: '1px solid #333' }}>
                    <td style={{ padding: '1rem', fontFamily: 'monospace' }}>
                      {wallet.walletAddress.substring(0, 8)}...{wallet.walletAddress.substring(wallet.walletAddress.length - 8)}
                    </td>
                    <td style={{ padding: '1rem', fontFamily: 'monospace', fontSize: '0.875rem', color: '#aaa' }}>
                      <Link href={`/entities/${wallet.entityId}`} style={{ color: '#0d6efd', textDecoration: 'none' }}>
                        {wallet.entityId}
                      </Link>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ 
                        padding: '0.25rem 0.5rem', 
                        background: wallet.status === 'approved' || wallet.status === 'synced' ? '#0f5132' 
                                  : wallet.status === 'rejected' ? '#842029' 
                                  : '#333', 
                        borderRadius: '4px', 
                        fontSize: '0.875rem' 
                      }}>
                        {wallet.status}
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ 
                        padding: '0.25rem 0.5rem', 
                        background: wallet.chainSyncStatus === 'sent' ? '#0f5132' 
                                  : wallet.chainSyncStatus === 'failed' ? '#842029' 
                                  : wallet.chainSyncStatus === 'skipped' ? '#333'
                                  : '#5c636a', 
                        borderRadius: '4px', 
                        fontSize: '0.875rem' 
                      }}>
                        {wallet.chainSyncStatus}
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <Link href={`/wallets/${wallet.id}`} style={{ color: '#0d6efd', textDecoration: 'none', fontWeight: 500 }}>
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
